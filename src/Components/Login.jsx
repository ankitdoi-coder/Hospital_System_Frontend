import React from 'react';
import Logo from "../assets/OnlyLogo.png";
import BackgroundImage from "../assets/BG4.jpg";
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex justify-center items-center p-4"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Login Card */}
      <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-md w-full">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="Logo" className="w-20 h-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Member Login</h2>
        </div>

        {/* Form */}
        <form>
          {/* Email Input */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
            </div>
            <input
              type="email"
              id="email"
              className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
              placeholder="Email Address"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input
              type="password"
              id="password"
              className="bg-white/50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500"
              placeholder="Password"
              required
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-gray-800">Remember me</label>
            </div>
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot Password?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-black-700 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-md px-5 py-3 text-center transition duration-300"
          >
            LOGIN
          </button>

          {/* Register Link */}
          <p className="text-sm font-medium text-center text-gray-700 mt-6">
            Not a member? <Link to="/register" className="text-blue-600 hover:underline font-bold">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;