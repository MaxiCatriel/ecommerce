import { z } from 'zod';

// Validation schemas
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(1000, 'El mensaje es demasiado largo')
    .trim(),
  role: z.enum(['user', 'assistant'], {
    message: 'El rol debe ser "user" o "assistant"'
  })
});

export const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Type inference
export type MessageInput = z.infer<typeof messageSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;