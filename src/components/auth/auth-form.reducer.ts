export type AuthFormMode = 'login' | 'register';

export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthFormField = keyof AuthFormValues;
export type AuthFormErrors = Partial<Record<AuthFormField, string>>;

interface AuthFormState {
  values: AuthFormValues;
  errors: AuthFormErrors;
}

type AuthFormAction =
  | { type: 'fieldChanged'; field: AuthFormField; value: string }
  | { type: 'validationFailed'; errors: AuthFormErrors };

export const initialAuthFormState: AuthFormState = {
  values: { name: '', email: '', password: '', confirmPassword: '' },
  errors: {},
};

export const authFormReducer = (
  state: AuthFormState,
  action: AuthFormAction,
): AuthFormState => {
  switch (action.type) {
    case 'fieldChanged': {
      const errors = { ...state.errors };
      delete errors[action.field];
      if (action.field === 'password') delete errors.confirmPassword;

      return {
        values: { ...state.values, [action.field]: action.value },
        errors,
      };
    }
    case 'validationFailed':
      return { ...state, errors: action.errors };
  }
};

export const validateAuthForm = (
  values: AuthFormValues,
  mode: AuthFormMode,
): AuthFormErrors => {
  const errors: AuthFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (mode === 'register') {
    if (!name) errors.name = 'Enter your name.';
    else if (name.length > 255) errors.name = 'Use no more than 255 characters.';
  }

  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > 255) errors.email = 'Use no more than 255 characters.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) errors.password = 'Enter your password.';
  else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (new TextEncoder().encode(values.password).length > 72) {
    errors.password = 'Your password is too long. Use fewer characters.';
  }

  if (mode === 'register') {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Your passwords do not match.';
    }
  }

  return errors;
};
