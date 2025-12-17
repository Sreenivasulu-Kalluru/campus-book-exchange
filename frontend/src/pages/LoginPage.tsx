// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, ApiError } from '../services/authService';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import AnimatedBook from '../components/AnimatedBook';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex items-center justify-center min-h-[80vh] w-full p-4">
      <div className="w-full max-w-4xl overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row">
        {/* Left Side - Animated Book (Hidden on small screens) */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-linear-to-br from-blue-50 to-indigo-100 p-8">
          <AnimatedBook />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-center text-primary mb-2">
            Welcome Back!
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Please sign in to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                className={`w-full px-3 py-2 mt-1 border rounded-lg shadow-sm transition-colors duration-200
                          ${
                            errors.email
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                placeholder="you@example.com"
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
                  })}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm pr-10 transition-colors duration-200
                            ${
                              errors.password
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                            }
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-primary transition-colors"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full px-4 py-3 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-primary hover:bg-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {isPending ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <p className="text-sm text-center text-dark-text mt-4">
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
    </div>
  );
};

export default LoginPage;
