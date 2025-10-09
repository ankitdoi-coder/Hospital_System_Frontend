import React from 'react'
import logoImg from "../assets/OnlyLogo.png";
const Navbar = () => {

    return (
        <div>
            <nav className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-md shadow-sm '>

                {/* Left section: Logo and Brand Name with Gradient */}
                <div className='flex items-center gap-3'>
                    <img className='h-10 w-auto' src={logoImg} alt="HealthCare Copilot Logo" />
                    <span className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'>
                        HealthCare Copilot
                    </span>
                </div>

                {/* Center section: Navigation Links with refined styling */}
                <div className='hidden md:flex'>
                    <ul className='flex items-center gap-8 font-semibold text-gray-500'>
                        <li>
                            <a href="#" className='transition duration-300 hover:text-indigo-600'>Home</a>
                        </li>
                        <li>
                            <a href="#" className='transition duration-300 hover:text-indigo-600'>Appointment</a>
                        </li>
                        <li>
                            <a href="#" className='transition duration-300 hover:text-indigo-600'>Services</a>
                        </li>
                        {/* Active link style */}
                        <li>
                            <a href="#" className='px-4 py-2 font-bold text-indigo-600 bg-indigo-100 rounded-lg'>About Us</a>
                        </li>
                        <li>
                            <a href="#" className='transition duration-300 hover:text-indigo-600'>Contact Us</a>
                        </li>
                    </ul>
                </div>

                {/* Right section: Action Buttons with clear visual hierarchy */}
                <div className='flex items-center gap-5'>
                    <a href="#" className='"bg-transparent hover:bg-blue-500 text-bfont-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'>
                        Sign In
                    </a>
                    <a
                        href="#"
                        className='bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
                    >
                        Register
                    </a>
                </div>

            </nav>
        </div>
    )
}

export default Navbar
