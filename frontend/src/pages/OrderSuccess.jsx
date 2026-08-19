import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

const OrderSuccess = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backend_url}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <Header />
        <div className='flex-1 flex justify-center items-center'>
          <p className='text-lg text-gray-500'>Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <Header />
        <div className='flex-1 flex flex-col justify-center items-center p-4'>
          <p className='text-xl text-red-500 mb-4'>{error || 'Order not found.'}</p>
          <Link to='/' className='bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg'>
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <Header />
      <div className='max-w-3xl mx-auto px-4 py-12'>
        <div className='bg-white rounded-2xl shadow-sm border p-8 flex flex-col items-center text-center'>
          
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce shadow-inner'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <h1 className='text-3xl font-extrabold text-gray-900 mb-2'>Order Placed Successfully!</h1>
          <p className='text-gray-500 mb-6'>
            Thank you for shopping with us. Your order <span className='font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded'>{orderId}</span> has been confirmed.
          </p>

          <div className='w-full border-t border-b py-6 my-6 text-left flex flex-col gap-4'>
            <div>
              <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Delivery Address</h3>
              <p className='text-sm font-bold text-gray-800'>{order.shippingAddress.name}</p>
              <p className='text-sm text-gray-600'>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
              <p className='text-sm text-gray-600'>{order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p className='text-sm text-gray-600'>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className='grid grid-cols-2 gap-4 border-t pt-4'>
              <div>
                <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Payment Method</h3>
                <p className='text-sm font-bold text-gray-800'>
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'Card' ? 'Credit Card' : 'UPI'}
                </p>
                <p className='text-xs text-gray-500'>Status: {order.paymentStatus}</p>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Estimated Delivery</h3>
                <p className='text-sm font-bold text-green-600'>{formattedDelivery}</p>
              </div>
            </div>

            <div className='border-t pt-4'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase mb-3'>Ordered Items</h3>
              <div className='flex flex-col gap-2'>
                {order.items.map((item, idx) => (
                  <div key={idx} className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600 truncate max-w-md'>
                      {item.name} <span className='text-xs font-semibold text-gray-400'>({item.size})</span> x {item.qty}
                    </span>
                    <span className='font-bold text-gray-800'>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='border-t pt-4 flex justify-between items-center'>
              <span className='text-base font-bold text-gray-800'>Total Paid</span>
              <span className='text-xl font-black text-gray-900'>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className='flex gap-4 w-full sm:w-auto mt-4'>
            <Link
              to='/'
              className='flex-1 sm:flex-none bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-150 text-center shadow-md'
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
