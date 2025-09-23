import { UseLogin } from '@/hooks/useLogin';

type ILogin = UseLogin;

export default function Login({
  register,
  onSubmit,
  handleSubmit,
  errors,
  isPending,
  submitError,
}: ILogin) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Welcome to Binder
          </h2>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            <div>
              <input
                {...register('email')}
                type='text'
                className={`relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-gray-700' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm`}
                placeholder='Email'
                disabled={isPending}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register('password')}
                type='password'
                className={`relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-gray-700' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-700 focus:border-gray-500 sm:text-sm`}
                placeholder='Password'
                disabled={isPending}
              />
              {errors.password && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <div className='text-red-600 text-sm text-center bg-red-50 p-3 rounded-md'>
              {submitError}
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={isPending}
              className='group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className='mt-6 p-4 bg-gray-900 rounded-md'>
          <h3 className='font-medium text-white'>Demo Accounts:</h3>
          <div className='mt-2 text-sm text-gray-200'>
            <p>
              <strong>alice@demo.com</strong> / password123
            </p>
            <p>
              <strong>bob@demo.com</strong> / password123
            </p>
            <p>
              <strong>charlie@demo.com</strong> / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
