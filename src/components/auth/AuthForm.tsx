import { useEffect, useReducer, useRef, type SubmitEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth/useAuth';
import {
  authFormReducer,
  initialAuthFormState,
  validateAuthForm,
  type AuthFormField,
  type AuthFormMode,
} from './auth-form.reducer';

interface AuthFormProps {
  mode: AuthFormMode;
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [{ values, errors }, dispatch] = useReducer(authFormReducer, initialAuthFormState);
  const { login, register, isSubmitting, error, clearError, cancelPendingAuth } = useAuth();
  const submittingRef = useRef(false);
  const isRegister = mode === 'register';

  useEffect(() => {
    clearError();
    return cancelPendingAuth;
  }, [clearError, cancelPendingAuth, mode]);

  const handleChange = (field: AuthFormField, value: string) => {
    dispatch({ type: 'fieldChanged', field, value });
    if (error) clearError();
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    clearError();
    const validationErrors = validateAuthForm(values, mode);
    dispatch({ type: 'validationFailed', errors: validationErrors });
    const firstError = Object.keys(validationErrors)[0];

    if (firstError) {
      const field = event.currentTarget.elements.namedItem(firstError);
      if (field instanceof HTMLInputElement) field.focus();
      return;
    }

    submittingRef.current = true;
    const credentials = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    try {
      if (isRegister) await register({ ...credentials, name: values.name.trim() });
      else await login(credentials);
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <>
      <CardContent className="px-6">
        <form data-testid="auth-form" className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
                maxLength={255}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="h-10"
              />
              {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@gmail.com"
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
              maxLength={255}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="h-10"
            />
            {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={values.password}
              onChange={(event) => handleChange('password', event.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : isRegister ? 'password-hint' : undefined}
              className="h-10"
            />
            {errors.password ? (
              <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
            ) : isRegister && (
              <p id="password-hint" className="text-sm text-muted-foreground">Use at least 8 characters.</p>
            )}
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                required
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                className="h-10"
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {isSubmitting
              ? isRegister ? 'Creating account...' : 'Signing in...'
              : isRegister ? 'Create account' : 'Sign in'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center px-6 py-4">
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? 'Already have an account? ' : 'New to the library? '}
          <Link
            to={isRegister ? '/login' : '/register'}
            className="rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-ring"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </CardFooter>
    </>
  );
};

export default AuthForm;
