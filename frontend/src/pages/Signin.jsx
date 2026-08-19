import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'

const Signin = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const { setUser } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    console.log(data)

    try {
      const response = await axios.post(`${backend_url}/api/auth/signin`, data)
      console.log('Sign-in successful:', response.data)
      
      const userData = {
        id: response.data.id,
        email: response.data.email,
        fullname: response.data.fullname
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', response.data.token)
      
      setMessage('Sign-in successful')
      navigate('/') // Redirect to home page after successful sign-in
    } catch (error) {
      setMessage(error.response?.data?.message || 'Sign-in failed')
      console.error('Sign-in failed:', error)
    }

  }

  return (
    <div className=' flex justify-center mt-20 ' >
      
      <form onSubmit={handleSubmit}  className="contener h-100 w-100 border rounded-lg gap-2 shadow flex flex-col justify-center items-center p-8">

        {message && <p className="text-red-500">{message}</p>}
        
        <input name="email" type="text" placeholder="email" className='rounded-md border p-2' />
        <input name="password" type="password" placeholder="Password" className='rounded-md border p-2' />
        <button type='submit' className='bg-gray-500 text-white px-4 py-2 rounded-md cursor-pointer'>Sign In</button>

        <Link to="/signup" className='text-blue-500 hover:underline'><p>Create an account</p></Link>



      </form>

    </div>
  )
}

export default Signin