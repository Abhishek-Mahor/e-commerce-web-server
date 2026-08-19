import React, { useContext } from 'react'
import Searchbar from './Search-bar'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import Sidebar from './Sidebar'


const Header = () => {
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext)
  const { user, toggleSidebar, isSidebarOpen } = useContext(AuthContext);

  const handleToggle = () => {
    if (!user) {
      navigate('/signin');
    } else {
      toggleSidebar();
    }
  };

  return (
    <div className='w-screen h-20 bg-white flex items-center justify-between '>
       <h1 className='text-black mx-4  text-2xl'>logo</h1>
       <nav>
         <ul className='flex gap-4 mx-2 text-gray-600 text-sm font-semibold'>
           <li><Link to='/' className='hover:underline hover:text-black transition'>Collection</Link></li>
           <li><Link to='/ai-stylist' className='hover:underline hover:text-black transition'>AI Stylist</Link></li>
         </ul>
       </nav>
        <Searchbar className=''/>
        <div className=''>
          <nav>
            <ul className='flex gap-2  text-gray-600 text-sm '>
              <li><Link to='/cart' className='hover:underline hover:text-black relative flex items-center p-1'>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-semibold animate-pulse'>
                    {cartCount}
                  </span>
                )}

              </Link></li>

              <li><button onClick={handleToggle} className='hover:underline hover:text-black flex items-center pt-1 cursor-pointer transition'>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>

              </button></li>
            </ul>
          </nav>
        </div>

        {isSidebarOpen && user && <Sidebar />}
    </div>
  )
}

export default Header