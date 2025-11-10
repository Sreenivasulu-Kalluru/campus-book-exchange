// src/pages/RegisterPage.tsx
import { useState } from 'react'; // <-- 1. Import useState
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterData, ApiError } from '../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // <-- 2. Import Eye icons

type RegisterFormData = RegisterData & {
  confirmPassword: string;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // --- 4. ADD STATES for password visibility ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterFormData) => {
      // We are intentionally ignoring 'confirmPassword' by destructuring it out.
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
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
    mutate(data);
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

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-dark-text"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm pr-10 
                          ${
                            errors.password
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-dark-text"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm pr-10
                          ${
                            errors.confirmPassword
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
