import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminLogin = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passcode, setPasscode] = useState('')  

  const navigate = useNavigate()

  const loginHandler = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post(`${backend_url}/admin/login`, {email,password,passcode});
      console.log(res.data);

      const token = res.data.token;
      if (token) {
        localStorage.setItem("adminToken", token);
        
        navigate('/admin/dashboard'); // Redirect to dashboard
      } 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Login failed! Please check your credentials.');
    }
  }









  return (
    <div className='flex items-center justify-center h-screen'>
      <form className='flex flex-col items-center justify-center h-100 w-100 border border-gray-300 rounded gap-3 shadow-lg '>
          <h1 className='text-2xl font-bold mb-4'>Admin Login</h1>

        <input onChange={e=>setEmail(e.target.value)} type='text' placeholder='Enter Email'  className='border border-gray-300 rounded px-2 py-1'/>
        <input onChange={e=>setPassword(e.target.value)} type='password' placeholder='Enter Password' className='border border-gray-300 rounded px-2 py-1'/>
        <input onChange={e=>setPasscode(e.target.value)} type='text' placeholder='Enter secret key' className='border border-gray-300 rounded px-2 py-1'/>

        <button onClick={loginHandler} className='bg-gray-600 hover:bg-gray-700 text-white rounded px-4 py-2'>Login</button>


      </form>
      
    </div>
  )
}

export default AdminLogin