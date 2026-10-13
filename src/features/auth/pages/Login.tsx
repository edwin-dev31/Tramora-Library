import AuthForm from '@/features/auth/components/AuthForm';
import AuthLayout from '@/features/auth/components/AuthLayout';

const Login = () => (
  <AuthLayout title="Welcome back" description="Sign in to your library account.">
    <AuthForm mode="login" />
  </AuthLayout>
);

export default Login;
