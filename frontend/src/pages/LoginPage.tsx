// src/pages/LoginPage.tsx
import { useState } from 'react'; // <-- 1. Import useState
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, ApiError } from '../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // <-- 2. Import Eye icons

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // --- 3. ADD STATE for password visibility ---
  const [showPassword, setShowPassword] = useState(false);
  // --- 4. TOGGLE FUNCTION ---
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success('Login Successful! Welcome back.');
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
                // --- 6. Dynamic type: showPassword ? 'text' : 'password' ---
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
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
                onClick={togglePasswordVisibility}
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
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-2 font-semibold text-white transition-all duration-300 rounded-lg shadow-md bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </div>

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
