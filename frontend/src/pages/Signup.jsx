import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Signup = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    console.log(data)
    
    try {
      const response = await axios.post(`${backend_url}/api/auth/signup`, data)
      setMessage(response.data.message)
      console.log('Signup successful:', response.data)
      navigate('/signin') // Redirect to signin page after successful signup
    } catch (error) {
      setMessage(error.response?.data?.message || 'Signup failed')
      console.error('Signup error:', error)
    }
  }

  return (
    
    <div className=' flex justify-center mt-20 ' >
      
      <form onSubmit={handleSubmit}  className="contener h-100 w-100 border rounded-lg gap-2 shadow flex flex-col justify-center items-center p-8">

        {message && <p className="text-red-500">{message}</p>}

        <input name="name" type="text" placeholder="name" className='rounded-md border p-2' />
        <input name="email" type="text" placeholder="email" className='rounded-md border p-2' />
        <input name="password" type="password" placeholder="Password" className='rounded-md border p-2' />
        <button type='submit' className='bg-gray-500 text-white px-4 py-2 rounded-md cursor-pointer'>Sign Up</button>

        <Link to="/signin" className='text-blue-500 hover:underline'><p>Already have an account? Sign In</p></Link>



      </form>

    </div>
  )
}

export default Signup