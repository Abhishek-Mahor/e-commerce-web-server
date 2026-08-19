import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'

const Orders = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const response = await axios.get(`${backend_url}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default: // Pending
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      <Header />
      
      <div className='max-w-4xl mx-auto px-4 py-8 mt-4'>
        <div className='flex flex-col gap-2 mb-8'>
          <h1 className='text-3xl font-black text-gray-900 tracking-tight'>Your Orders</h1>
          <p className='text-sm text-gray-500 font-semibold'>Track and manage your order history and status</p>
        </div>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl border border-red-100 mb-6'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-3'>
            <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className='text-gray-400 text-sm font-bold'>Loading order records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md mx-auto mt-8 flex flex-col items-center gap-4'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <h2 className='text-lg font-bold text-gray-800'>No orders found</h2>
            <p className='text-gray-500 text-xs font-semibold'>You haven't placed any orders yet.</p>
            <button 
              onClick={() => navigate('/')} 
              className='mt-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-md'
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            {orders.map((order) => (
              <div key={order._id} className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col'>
                
                {/* Order Header Info */}
                <div className='bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between'>
                  <div className='flex items-center gap-6'>
                    <div>
                      <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5'>Order ID</p>
                      <p className='font-mono text-xs font-semibold text-gray-700'>{order._id}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5'>Date Placed</p>
                      <p className='text-xs font-semibold text-gray-700'>{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5'>Total Amount</p>
                      <p className='text-xs font-black text-gray-900'>₹{order.totalAmount}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Pipeline */}
                <div className='px-6 py-5 border-b border-gray-100 bg-white'>
                  {order.orderStatus === 'Cancelled' ? (
                    <div className='flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-xl text-xs font-bold'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      This order was cancelled.
                    </div>
                  ) : (
                    <div className='flex items-center justify-between text-[10px] font-bold text-gray-400 relative max-w-md mx-auto pt-1'>
                      {/* Tracking pipeline connector line */}
                      <div className='absolute left-2 right-2 top-2 h-0.5 bg-gray-200 -z-10'>
                        <div className={`h-full bg-green-500 transition-all duration-300 ${
                          order.orderStatus === 'Delivered' ? 'w-full' :
                          order.orderStatus === 'Shipped' ? 'w-2/3' :
                          order.orderStatus === 'Processing' ? 'w-1/3' : 'w-0'
                        }`} />
                      </div>
                      
                      {/* Individual Steps */}
                      {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                        const isCompleted = 
                          (index === 0) || 
                          (index === 1 && ['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus)) ||
                          (index === 2 && ['Shipped', 'Delivered'].includes(order.orderStatus)) ||
                          (index === 3 && order.orderStatus === 'Delivered');

                        return (
                          <div key={step} className='flex flex-col items-center gap-1.5'>
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] ${
                              isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <span className={isCompleted ? 'text-green-600 font-extrabold' : ''}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items & Shipping Address */}
                <div className='grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100 flex-1'>
                  
                  {/* Left block: Ordered Items (7 columns) */}
                  <div className='md:col-span-7 p-6 flex flex-col gap-3.5'>
                    <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>Items Ordered</h3>
                    <div className='flex flex-col gap-3'>
                      {order.items.map((item, idx) => (
                        <div key={idx} className='flex gap-3 items-center'>
                          <div className='w-11 h-11 bg-gray-50 border rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 uppercase'>
                            {item.name[0]}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-bold text-gray-800 truncate'>{item.name}</p>
                            <p className='text-[10px] text-gray-400 font-semibold'>
                              Size: <span className='text-gray-600'>{item.size}</span> | Color: <span className='text-gray-600'>{item.color || 'Default'}</span> | Qty: <span className='text-gray-600'>{item.qty}</span>
                            </p>
                          </div>
                          <span className='text-xs font-extrabold text-gray-900 shrink-0'>
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right block: Delivery Details & Info (5 columns) */}
                  <div className='md:col-span-5 p-6 bg-gray-50/30 flex flex-col gap-4'>
                    <div>
                      <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>Delivery Address</h3>
                      <p className='text-xs font-bold text-gray-800 mb-0.5'>{order.shippingAddress.name}</p>
                      <p className='text-xs text-gray-600 leading-normal'>{order.shippingAddress.address}</p>
                      <p className='text-xs text-gray-600'>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                      <p className='text-xs text-gray-500 font-semibold mt-1.5'>Phone: {order.shippingAddress.phone}</p>
                    </div>

                    <div className='border-t border-gray-100 pt-3 flex flex-col gap-1.5'>
                      <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Shipment Details</h3>
                      {order.deliveryPartner && order.deliveryPartner !== 'None' ? (
                        <div>
                          <p className='text-xs text-gray-700 font-medium'>
                            Carrier: <span className='font-bold text-gray-900'>{order.deliveryPartner}</span>
                          </p>
                          <p className='text-xs text-gray-700 font-medium'>
                            Tracking: <span className='font-mono font-bold text-blue-600'>{order.trackingNumber}</span>
                          </p>
                        </div>
                      ) : (
                        <p className='text-xs text-gray-400 font-semibold italic'>
                          {order.orderStatus === 'Cancelled' ? 'N/A' : 'Preparing for shipment...'}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders