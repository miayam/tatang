import useLogin from '@/hooks/useLogin';

import Component from '@/components/forms/Login';

export default function Login() {
  const props = useLogin();
  return <Component {...props} />;
}
