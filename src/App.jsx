import './App.css'
import Navbar from './Components/Navbar'
import Home from './Components/Home'
import Seprater from './Components/Seprater'
import Footer from './Components/Footer'
function App() {
  return (
    <>
      <div className="overflow-x-hidden bg-white-100 bg-cover bg-center bg-no-repeat w-screen h-screen">
        <Navbar/>
        <Home/>
        
        <Footer/>
      </div>
    </>
  )
}

export default App