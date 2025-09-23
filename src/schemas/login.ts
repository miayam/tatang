import z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'The input format for email is incorrect',
  }),
  password: z
    .string()
    .nonempty({ message: 'Password must contain at least 8 character(s)' }),
});

export type LoginData = z.infer<typeof LoginSchema>;
