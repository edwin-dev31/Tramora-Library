import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from './AuthForm';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { MemoryRouter } from 'react-router';

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockClearError = jest.fn();
const mockCancelPendingAuth = jest.fn();
const mockLogout = jest.fn();

let mockIsSubmitting = false;
let mockError: string | null = null;

const createMockAuth = (_overrides: Partial<{
  isSubmitting: boolean;
  error: string | null;
}> = {}) => {
  
  return {
    login: mockLogin,
    register: mockRegister,
    get isSubmitting() {
      return mockIsSubmitting;
    },
    get error() {
      return mockError;
    },
    clearError: mockClearError,
    cancelPendingAuth: mockCancelPendingAuth,
    user: null,
    status: 'unauthenticated' as const,
    logout: mockLogout,
  };
};

jest.mock('@/context/auth/useAuth', () => ({
  useAuth: () => createMockAuth(),
}));

const renderAuthForm = (mode: 'login' | 'register') => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthForm mode={mode} />
      </AuthProvider>
    </MemoryRouter>
  );
};

const fillValidLoginForm = async () => {
  const emailInput = screen.getByLabelText('Email');
  await userEvent.type(emailInput, 'test@example.com');
  const passwordInput = screen.getByLabelText('Password');
  await userEvent.type(passwordInput, 'password123');
};

const fillValidRegisterForm = async () => {
  const nameInput = screen.getByLabelText('Name');
  await userEvent.type(nameInput, 'Test User');
  const emailInput = screen.getByLabelText('Email');
  await userEvent.type(emailInput, 'test@example.com');
  const passwordInput = screen.getByLabelText('Password');
  await userEvent.type(passwordInput, 'password123');
  const confirmInput = screen.getByLabelText('Confirm password');
  await userEvent.type(confirmInput, 'password123');
};

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
    mockIsSubmitting = false;
    mockError = null;
  });

  describe('Login mode', () => {
    it('renders email and password fields', () => {
      renderAuthForm('login');
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('does not render name and confirm password fields', () => {
      renderAuthForm('login');
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
    });

    it('renders "Sign in" button', () => {
      renderAuthForm('login');
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('renders link to register', () => {
      renderAuthForm('login');
      expect(screen.getByText('New to the library?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create an account' })).toBeInTheDocument();
    });

    it('validates required email field', async () => {
      renderAuthForm('login');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderAuthForm('login');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'invalid-email');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });
    });

    it('validates required password field', async () => {
      renderAuthForm('login');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Enter your password.')).toBeInTheDocument();
      });
    });

    it('validates minimum password length', async () => {
      renderAuthForm('login');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'short');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
      });
    });

    it('calls login on valid submit', async () => {
      renderAuthForm('login');
      await fillValidLoginForm();
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('trims and lowercases email', async () => {
      renderAuthForm('login');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, '  TEST@EXAMPLE.COM  ');
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'password123');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Register mode', () => {
    it('renders all fields including name and confirm password', () => {
      renderAuthForm('register');
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    });

    it('renders "Create account" button', () => {
      renderAuthForm('register');
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });

    it('renders link to login', () => {
      renderAuthForm('register');
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('validates required name field', async () => {
      renderAuthForm('register');
      const submitButton = screen.getByRole('button', { name: 'Create account' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Enter your name.')).toBeInTheDocument();
      });
    });

    it('validates required confirm password field', async () => {
      renderAuthForm('register');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'password123');
      const submitButton = screen.getByRole('button', { name: 'Create account' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Confirm your password.')).toBeInTheDocument();
      });
    });

    it('validates password match', async () => {
      renderAuthForm('register');
      const nameInput = screen.getByLabelText('Name');
      await userEvent.type(nameInput, 'Test User');
      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test@example.com');
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'password123');
      const confirmInput = screen.getByLabelText('Confirm password');
      await userEvent.type(confirmInput, 'different123');
      const submitButton = screen.getByRole('button', { name: 'Create account' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Your passwords do not match.')).toBeInTheDocument();
      });
    });

    it('calls register on valid submit', async () => {
      renderAuthForm('register');
      await fillValidRegisterForm();
      const submitButton = screen.getByRole('button', { name: 'Create account' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });
      });
    });

    it('shows password hint in register mode', () => {
      renderAuthForm('register');
      expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    });

    it('does not show password hint in login mode', () => {
      renderAuthForm('login');
      expect(screen.queryByText('Use at least 8 characters.')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('displays error message from context', async () => {
      mockError = 'Invalid credentials';
      renderAuthForm('login');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
      });
    });

    it('clears error when user starts typing', async () => {
      mockError = 'Some error';
      renderAuthForm('login');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('Email');
      await userEvent.type(emailInput, 'test');
      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-invalid attributes', async () => {
      renderAuthForm('login');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('has proper aria-describedby for errors', async () => {
      renderAuthForm('login');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });

    it('focuses first invalid field on submit', async () => {
      renderAuthForm('login');
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toHaveFocus();
      });
    });

    it('form has noValidate attribute', () => {
      renderAuthForm('login');
      const form = screen.getByTestId('auth-form') as HTMLFormElement;
      expect(form).toHaveAttribute('noValidate');
    });
  });
});