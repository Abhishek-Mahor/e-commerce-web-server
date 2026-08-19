import React from 'react'

const CartProductCard = ({ 
  productId, 
  productName, 
  price, 
  productColor, 
  image, 
  quantity, 
  size, 
  onUpdateQuantity, 
  onRemove 
}) => {
  return (
    <div className='mb-5'>
      <div className='bg-white w-full max-w-2xl h-40 flex items-center gap-4 rounded-lg shadow p-4'>
        <img className="w-24 h-32 bg-gray-200 rounded object-cover" src={image} alt={productName} />
        <div className='flex flex-col gap-1 flex-1'>
          <h3 className='text-lg font-bold'>{productName}</h3>
          <p className='text-gray-500 text-sm'><span className='font-semibold'>Color:</span> {productColor}</p>
          <p className='text-gray-500 text-sm'><span className='font-semibold'>Size:</span> {size}</p>
          <p className='text-gray-800 font-bold text-lg mt-1'>₹{price}</p>
        </div>
        <div className='flex flex-col items-end justify-between h-full py-2'>
          <button onClick={onRemove} className='text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-150'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className='flex items-center gap-2 border rounded p-1 bg-gray-50'>
            <button 
              onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))} 
              className='bg-gray-500 hover:bg-gray-600 text-white px-2.5 py-0.5 rounded text-sm font-bold cursor-pointer transition-colors duration-150'
            >
              -
            </button>
            <span className='px-2 text-sm font-semibold'>{quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(quantity + 1)} 
              className='bg-gray-500 hover:bg-gray-600 text-white px-2.5 py-0.5 rounded text-sm font-bold cursor-pointer transition-colors duration-150'
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartProductCard