'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import login from '@/app/actions/login';
import { LoginData, LoginSchema } from '@/schemas/login';

export default function useLogin() {
  const [isPending, startTransition] = useTransition();
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
      const result = await login(data);

      if (result.success) {
        router.push('/spaces');
        router.refresh();
      } else {
        toast.error(result.error || 'Login failed');
      }
    });
  };

  return {
    handleSubmit,
    errors,
    onSubmit,
    isPending,
    register,
  };
}

export type UseLogin = ReturnType<typeof useLogin>;
