'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { getSession } from '@/lib/session';

import { LoginData, LoginSchema } from '@/schemas/login';

const prisma = new PrismaClient();

export default async function login(data: LoginData) {
  // Validate input with Zod
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid form data',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }],
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    return {
      success: true,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred during login',
    };
  }
}
