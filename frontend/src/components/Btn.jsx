import React from 'react'

const Btn = ({ className = "" ,label, onClick }) => {
  return (
    <div >
        <button className={`bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`} onClick={onClick}>
            {label}
        </button>
    </div>
  )
}

export default Btn