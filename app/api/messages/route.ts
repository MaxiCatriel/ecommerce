import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../auth';
import { prisma } from '../../../lib/db';
import { AuthenticationError, ValidationError, withErrorHandler } from '../../../lib/errors';
import { MessageInput, messageSchema } from '../../../lib/validation';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
const SUPPORT_SYSTEM_PROMPT = `Eres un experto vendedor en farmacologia deportiva y suplementos deportivos. Responde siempre en espanol latino neutro, ofrece recomendaciones de productos y asesoria responsable sobre farmacologia aplicada al deporte y suplementacion, mantente cordial y manten las respuestas breves pero utiles. No abandones ese rol y aclara cuando no tengas informacion disponible.`;

async function getMessages() {
  const session = (await getServerSession(authOptions)) as any;
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthenticationError();
  }

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return NextResponse.json(messages);
}

async function createMessage(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthenticationError();
  }

  const body = await request.json();

  // Validate input
  const validationResult = messageSchema.safeParse(body);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || 'Invalid input';
    throw new ValidationError(errorMessage);
  }

  const { content }: MessageInput = validationResult.data;
  const trimmedContent = content.trim();

  const userMessage = await prisma.message.create({
    data: {
      content: trimmedContent,
      userId,
      isFromAdmin: false
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      userMessage,
      aiMessage: null,
      error: 'GEMINI_API_KEY is not configured'
    });
  }

  const history = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      content: true,
      isFromAdmin: true
    }
  });

  const geminiContents = [
    {
      role: 'user',
      parts: [
        {
          text: `Instrucciones del sistema: ${SUPPORT_SYSTEM_PROMPT}`
        }
      ]
    },
    ...history.map((message: { content: string; isFromAdmin: boolean }) => ({
      role: message.isFromAdmin ? 'model' : 'user',
      parts: [{ text: message.content }]
    }))
  ];

  const completionResponse = await fetch(
    `${GEMINI_API_BASE_URL}/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.3
        }
      })
    }
  );

  if (!completionResponse.ok) {
    const errorBody = await completionResponse.text();
    console.error('Gemini API error:', completionResponse.status, errorBody);
    return NextResponse.json({
      userMessage,
      aiMessage: null,
      error: 'Error retrieving AI response'
    });
  }

  const completionData = await completionResponse.json();
  const candidate = completionData?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const aiContent = parts
    .map((part: { text?: string }) => part.text ?? '')
    .join(' ')
    .trim();

  if (!aiContent) {
    return NextResponse.json({
      userMessage,
      aiMessage: null,
      error: 'Empty response from AI provider'
    });
  }

  const aiMessage = await prisma.message.create({
    data: {
      content: aiContent,
      userId,
      isFromAdmin: true
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return NextResponse.json({ userMessage, aiMessage });
}

export const GET = withErrorHandler(getMessages);
export const POST = withErrorHandler(createMessage);
