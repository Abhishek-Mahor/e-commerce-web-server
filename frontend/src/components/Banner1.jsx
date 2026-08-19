import React from 'react'
import Btn from './Btn'

const Banner1 = ({ classname = "" }) => {
  return (
    <div className={`w-screen h-100 object-fit bg-[url("assets/image/banner1.jpg")]  border border-gray-300 ${classname}`}>
      <div className=''>
          

          <h1 className='text-5xl font-bold text-white text-center pt-20 w-70 ml-5 mt-20 drop-shadow'>Welcome to our online store!</h1>
           

      </div>
        
        
    </div>
  )
}

export default Banner1