import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

const Register = () => (
  <AuthLayout title="Create your account" description="Join the library and find your next read.">
    <AuthForm mode="register" />
  </AuthLayout>
);

export default Register;
