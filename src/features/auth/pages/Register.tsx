import AuthForm from '@/features/auth/components/AuthForm';
import AuthLayout from '@/features/auth/components/AuthLayout';

const Register = () => (
  <AuthLayout
    title="Create your account"
    description="Join the library and find your next read."
  >
    <AuthForm mode="register" />
  </AuthLayout>
);

export default Register;
