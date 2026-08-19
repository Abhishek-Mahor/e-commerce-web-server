import React from 'react'

const Footer = () => {
  return (
    <div className='bg-white w-screen h-20 flex justify-around items-center mt-50'>
       
        <nav>
         <ul className='flex gap-5 mx-5 text-gray-600'>
           
           <li><a href='/about'>Term</a></li>
           <li><a href='/contact'>Contact</a></li>
         </ul>
       </nav>
       <h6 className='text-gray-500 text-sm'>© 2023 Your Company. All rights reserved.</h6>

    </div>
  )
}

export default Footer