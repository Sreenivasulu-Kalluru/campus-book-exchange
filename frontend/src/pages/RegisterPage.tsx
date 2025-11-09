// src/pages/RegisterPage.tsx
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterData, ApiError } from '../services/authService';
import toast from 'react-hot-toast';

// --- 1. NEW TYPE: Define the shape of our FORM data ---
// This includes the 'confirmPassword' field.
type RegisterFormData = RegisterData & {
  confirmPassword: string;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>(); // <-- 2. Use the new, correct form type

  const { mutate, isPending } = useMutation({
    // --- 3. NEW MUTATION FN: Transform data before sending ---
    mutationFn: (data: RegisterFormData) => {
      // We are intentionally ignoring 'confirmPassword' by destructuring it out.
      // We tell ESLint to ignore the "unused var" error for the next line.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      return registerUser(registerData);
    },
    onSuccess: (data) => {
      toast.success('Account created successfully! Welcome.');
      login(data);
      navigate('/');
    },
    onError: (error: ApiError | Error) => {
      let message = 'An unexpected error occurred.';
      if ('response' in error) {
        // This is our ApiError
        message = error.response.data.message;
      } else if (error.message) {
        // This is a standard Error
        message = error.message;
      }
      toast.error(message || 'Registration failed. Please try again.');
    },
  });

  // --- 4. Use the correct SubmitHandler type ---
  const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
    mutate(data); // This will send the full form data to our new mutationFn
  };

  const password = watch('password');

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary">
          Create Your Account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field (unchanged) */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-dark-text"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm 
                        ${errors.name ? 'border-red-500' : 'border-gray-300'}
                        focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field (unchanged) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-dark-text"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm 
                        ${errors.email ? 'border-red-500' : 'border-gray-300'}
                        focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field (unchanged) */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-dark-text"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm 
                        ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-dark-text"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              // --- 5. Removed the 'as any' hack ---
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm 
                        ${
                          errors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button (unchanged) */}
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-sm text-center text-dark-text">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
