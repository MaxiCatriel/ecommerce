import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../auth';
import { prisma } from '../../../../lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    const userRole = session?.user?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all messages grouped by user
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Group messages by user
    const messagesByUser = messages.reduce((acc: Record<string, { user: any; messages: any[] }>, message: any) => {
      const userId = message.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: message.user,
          messages: []
        };
      }
      acc[userId].messages.push(message);
      return acc;
    }, {});

    return NextResponse.json(Object.values(messagesByUser));
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    const userRole = session?.user?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, userId } = await request.json();
    if (!content?.trim() || !userId) {
      return NextResponse.json({ error: 'Message content and userId are required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId,
        isFromAdmin: true
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating admin message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}