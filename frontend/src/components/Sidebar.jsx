import React from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
const Sidebar = () => {

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/signin'
  }

    const {user}=useContext(AuthContext)

    if(!user)
    {
        return (
            <div className='w-50 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col gap-15 items-center border  absolute right-0 top-20'>
                
                <div className=" mt-10">
                </div>
                </div>
        )
    }
    
  return (
    <div className='w-50 h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col gap-15 items-center border  absolute right-0 top-20 z-10 '>
      
      <div className=" mt-10">

      <div className="rounded-full border w-20 h-20 bg-white "><h1 className='flex justify-center mt-4 text-4xl font-bold  '> {user.fullname[0].toUpperCase()}</h1> </div>
      <h1 className='text-center'>{user.fullname}</h1>


      </div>


      <div className="">
        <nav>
           <NavLink to="/orders" className="text-gray-600 hover:text-gray-900 font-semibold hover:underline">Orders</NavLink>
        </nav>
      </div>
      <button onClick={logout} className='bg-gray-500 text-white py-2 px-4 rounded cursor-pointer mt-20 absolute bottom-30  '>Logout</button>

    </div>
  )
}

export default Sidebar