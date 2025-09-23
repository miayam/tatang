'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import login from '@/app/actions/login';
import { LoginData, LoginSchema } from '@/schemas/login';

export default function useLogin() {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string>('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginData) => {
    startTransition(async () => {
      setSubmitError('');

      const result = await login(data);

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setSubmitError(result.error || 'Login failed');
      }
    });
  };

  return {
    handleSubmit,
    errors,
    onSubmit,
    isPending,
    submitError,
    register,
  };
}

export type UseLogin = ReturnType<typeof useLogin>;
