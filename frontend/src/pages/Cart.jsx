import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import OrderSummary from '../components/OrderSummary'
import CartProductCard from '../components/CartProductCard'
import { CartContext } from '../context/CartContext'

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useContext(CartContext);

  return (
    <div className='min-h-screen bg-gray-50 pb-12'>
      <Header />
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-extrabold text-gray-900 mb-8'>Shopping Bag</h1>

        {loading ? (
          <div className='text-center py-12'>
            <p className='text-lg text-gray-500'>Loading your bag...</p>
          </div>
        ) : cart.items.length === 0 ? (
          <div className='bg-white rounded-xl shadow-sm border p-12 text-center max-w-xl mx-auto'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16 mx-auto text-gray-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Your bag is empty</h2>
            <p className='text-gray-500 mb-6'>Looks like you haven't added anything to your cart yet.</p>
            <Link 
              to="/" 
              className='inline-block bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-150'
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-8 items-start'>
            {/* Cart Items List */}
            <div className='flex-1 w-full'>
              {cart.items.map((item) => (
                <CartProductCard
                  key={`${item.productId}-${item.size}`}
                  productId={item.productId}
                  productName={item.productName}
                  price={item.price}
                  productColor={item.productColor}
                  image={item.image}
                  quantity={item.quantity}
                  size={item.size}
                  onUpdateQuantity={(newQty) => updateQuantity(item.productId, newQty, item.size)}
                  onRemove={() => removeFromCart(item.productId, item.size)}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className='w-full lg:w-auto lg:sticky lg:top-4'>
              <OrderSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart