// src/pages/LoginPage.tsx
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, ApiError } from '../services/authService';
import toast from 'react-hot-toast'; // <-- 1. IMPORT TOAST

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const { mutate, isPending } = useMutation({
    // <-- 2. REMOVED isError/error
    mutationFn: loginUser,
    onSuccess: (data) => {
      // --- 3. ON SUCCESS ---
      toast.success('Login Successful! Welcome back.');
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
      toast.error(message || 'Invalid email or password.');
    },
  });

  const onSubmit: SubmitHandler<LoginCredentials> = (data) => {
    mutate(data);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field (no changes) */}
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

          {/* Password Field (no changes) */}
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

          {/* 5. REMOVED the old server error message here */}

          {/* Submit Button (no changes) */}
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {/* Link to Register (no changes) */}
          <p className="text-sm text-center text-dark-text">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
