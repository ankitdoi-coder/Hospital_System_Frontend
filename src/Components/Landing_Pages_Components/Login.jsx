import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setAuth } from '../../store/slices/authSlice';
import Logo from "../../assets/OnlyLogo.png";
import BackgroundImage from "../../assets/BG4.jpg";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { LoginUser, saveToken, getDashboardRoute, getToken, getUserRole, getUserEmail } from "../../Services/AuthService.js";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      console.log('OAuth token received:', token);

      // Save token to localStorage
      saveToken(token);

      // Get user role and email
      const userRole = getUserRole();
      const userEmail = getUserEmail();

      // Update Redux state
      dispatch(setAuth({
        user: userEmail,
        token: token,
        role: userRole
      }));

      // Show success toast
      toast.success('Google Login Successful! Redirecting...', {
        duration: 2000,
        position: 'top-center',
      });

      // Navigate to dashboard
      const dashboardRoute = getDashboardRoute();
      setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 1500);

    } else if (error) {
      console.error('OAuth error:', error);
      toast.error('Google Login failed. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
    }
  }, [location.search, navigate, dispatch]);

  const onSubmit = async (data) => {
    console.log('Login data:', data);

    try {
      // Call the login API
      const response = await LoginUser(data);

      console.log('Login response:', response);

      // Extract JWT token from response
      const token = response.data.jwt;
      console.log('Extracted token:', token);

      if (token) {
        // Save token to localStorage
        saveToken(token);
        console.log('Token saved to localStorage');

        // Verify token was saved
        const savedToken = getToken();
        console.log('Retrieved token from localStorage:', savedToken);

        // Get user role and email
        const userRole = getUserRole();
        const userEmail = getUserEmail();
        console.log('User role extracted:', userRole);
        console.log('User email extracted:', userEmail);

        // Update Redux state
        dispatch(setAuth({
          user: userEmail,
          token: token,
          role: userRole
        }));

        // Get dashboard route
        const dashboardRoute = getDashboardRoute();
        console.log('Dashboard route determined:', dashboardRoute);

        // Show success toast
        toast.success('Login Successful! Redirecting to Dashboard...', {
          duration: 2000,
          position: 'top-center',
        });


        // Navigate after 1.5 seconds
        console.log('Setting timeout to navigate...');
        setTimeout(() => {
          console.log('Timeout executed, navigating to:', dashboardRoute);
          navigate(dashboardRoute, { replace: true });
          console.log('Navigate called');
        }, 1500);
      } else {
        toast.error('Login failed. No token received.', {
          duration: 3000,
          position: 'top-center',
        });
      }

    } catch (error) {
      console.error('Login error:', error);

      // Handle different error types
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = '❌ Cannot connect to server. Please check if backend is running.';
      } else if (error.response) {
        if (error.response.status === 401) {
          // Unauthorized - wrong credentials or unapproved doctor
          errorMessage = error.response.data?.jwt ||
            error.response.data?.message ||
            'Invalid email or password.';
        } else {
          errorMessage = error.response.data?.message ||
            `Error: ${error.response.status}`;
        }
      }

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden">
      <Toaster />

      {/* Left panel — brand / form */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 sm:px-12 py-12 bg-white relative overflow-y-auto">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />

        <div className="max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/20 mb-5 p-3">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to your HealthCare account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg className="w-4.5 h-4.5 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: {
                      value: true,
                      message: "⚠️ Email is required"
                    },
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "⚠️ Invalid email address"
                    }
                  })}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 py-3 placeholder-gray-400 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <span className="text-red-600 text-xs mt-1.5 block font-medium">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg className="w-4.5 h-4.5 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  {...register("password", {
                    required: {
                      value: true,
                      message: "⚠️ Password is required"
                    },
                    minLength: {
                      value: 6,
                      message: "⚠️ Password must be at least 6 characters"
                    }
                  })}
                  type="password"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full pl-10 py-3 placeholder-gray-400 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <div className="text-red-600 text-xs mt-1.5 font-medium">
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-gray-600">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:outline-none focus:ring-purple-200 font-semibold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-lg shadow-purple-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase tracking-wide">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm px-5 py-3 text-center flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Register Link */}
            <p className="text-sm text-center text-gray-500 pt-2">
              Not a member?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Register now
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right panel — hero image */}
      <div
        className="hidden lg:block flex-1 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-indigo-900/50 to-transparent" />

        <div className="relative h-full flex flex-col justify-center p-12 xl:p-16">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Trusted by patients nationwide
            </div>
            <h3 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
              Your health, managed in one place.
            </h3>
            <p className="text-purple-100 text-sm xl:text-base leading-relaxed">
              Book appointments, track prescriptions, and manage payments securely — all from a single dashboard built around you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;