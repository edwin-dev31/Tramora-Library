import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

const Login = () => (
  <AuthLayout title="Welcome back" description="Sign in to your library account.">
    <AuthForm mode="login" />
  </AuthLayout>
);

export default Login;
