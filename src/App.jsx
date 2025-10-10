
import './App.css';
import Register from './Components/Register';
import Login from './Components/Login'
import Home from './Components/Home';
import Layout from './Components/Layout'; // Import your new Layout component
import ContactUs from './Components/ContactUs';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Error404 from './Components/Error404';
import AboutUs from './Components/AboutUs';
import ServicesPage from './Components/ServicesPage';
import AppointmentService from './Components/AppointmentService';

function App() {
  // In App.jsx

  // ... import your Login component, e.g., import Login from './Components/Login';

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/home",
          element: <Home />
        },
        {
          path: "/login",
          element: <Login />
        },
        {
          path: "/register",
          element: <Register />
        },
        {
          path: "/contactUs",
          element: <ContactUs />
        },
        {
          path: "/about",
          element: <AboutUs />
        },
        {
          path:"/services",
          element:<ServicesPage/>
        },
        {
          path:"/appointment",
          element:<AppointmentService/>
        }
      ]
    },
    {
      path: "*",
      element: <Error404 />
    }
  ]);

  return (
    <>
      <div className="overflow-x-hidden bg-white-100 bg-cover bg-center bg-no-repeat w-screen h-screen">
        {/* The RouterProvider should be the only thing you render here */}
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;