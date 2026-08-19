import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'

const Checkout = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { cart, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [error, setError] = useState('');

  // Load Razorpay checkout script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch saved address from profile on mount
  useEffect(() => {
    const loadSavedAddress = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setFetchingAddress(true);
      try {
        const response = await axios.get(`${backend_url}/api/address`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.address) {
          const addr = response.data.address;
          if (addr.address || addr.city || addr.state || addr.zipCode || addr.phone) {
            setShippingAddress({
              name: user?.fullname || '',
              address: addr.address || '',
              city: addr.city || '',
              state: addr.state || '',
              zipCode: addr.zipCode || '',
              phone: addr.phone || ''
            });
            setHasSavedAddress(true);
          }
        }
      } catch (err) {
        console.error("Error loading saved address:", err);
      } finally {
        setFetchingAddress(false);
      }
    };

    if (user) {
      loadSavedAddress();
    }
  }, [user]);

  // If user is not logged in, redirect to signin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!loading && cart.items.length === 0) {
      const timer = setTimeout(() => {
        if (cart.items.length === 0) {
          navigate('/cart');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    const { name, address, city, state, zipCode, phone } = shippingAddress;
    if (!name || !address || !city || !state || !zipCode || !phone) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Optionally save address to profile database
      if (saveToProfile) {
        try {
          await axios.post(
            `${backend_url}/address/addAddress`,
            { address, city, state, zipCode, phone },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } catch (addrErr) {
          console.error("Failed to sync address to profile:", addrErr);
        }
      }

      if (paymentMethod === 'COD') {
        // Place Cash on Delivery order
        const response = await axios.post(`${backend_url}/api/orders`, {
          shippingAddress,
          paymentMethod: 'COD'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        await fetchCart();
        navigate(`/order-success/${response.data.orderId}`);
      } else {
        // Create Razorpay Order
        const orderRes = await axios.post(`${backend_url}/api/orders/razorpay`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { keyId, order: razorpayOrder } = orderRes.data;

        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "E-Commerce Store",
          description: "Secure Checkout Payment",
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              setLoading(true);
              // Verify signature and place order
              const verifyRes = await axios.post(`${backend_url}/api/orders/verify`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress
              }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });

              await fetchCart();
              navigate(`/order-success/${verifyRes.data.orderId}`);
            } catch (verifyErr) {
              console.error("Payment verification failed:", verifyErr);
              setError(verifyErr.response?.data?.message || 'Payment verification failed. Please try again.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: shippingAddress.name,
            contact: shippingAddress.phone,
            email: user?.email || ''
          },
          theme: {
            color: "#000000"
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Order placement error:', err);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      <Header />
      
      <div className='max-w-6xl mx-auto px-4 py-8 mt-4'>
        <h1 className='text-3xl font-black text-gray-900 mb-8 tracking-tight'>Secure Checkout</h1>
        
        {error && (
          <div className='bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl border border-red-100 mb-6 shadow-sm animate-shake'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          
          {/* LEFT: Shipping & Payment Form */}
          <form onSubmit={handlePlaceOrder} className='lg:col-span-7 flex flex-col gap-6'>
            
            {/* Shipping Address Box */}
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5'>
              <div className='flex items-center justify-between border-b pb-4'>
                <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                  <span className='w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center'>1</span>
                  Shipping Address
                </h2>
                {hasSavedAddress && (
                  <span className='bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-green-100'>
                    Default Address Loaded
                  </span>
                )}
              </div>

              {fetchingAddress ? (
                <div className='py-6 text-center text-sm text-gray-400 font-medium'>
                  Retrieving saved address details...
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Recipient's Full Name</label>
                    <input 
                      type='text' 
                      name='name'
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      placeholder='First and last name'
                      className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200 font-medium'
                      required
                    />
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Street Address</label>
                    <input 
                      type='text' 
                      name='address'
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      placeholder='Flat, House no., Building, Company, Apartment, Street'
                      className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>City</label>
                      <input 
                        type='text' 
                        name='city'
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        placeholder='e.g. Mumbai'
                        className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200 font-medium'
                        required
                      />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>State</label>
                      <input 
                        type='text' 
                        name='state'
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        placeholder='e.g. Maharashtra'
                        className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200 font-medium'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>ZIP Code</label>
                      <input 
                        type='text' 
                        name='zipCode'
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        placeholder='6-digit postal code'
                        className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200 font-mono'
                        required
                      />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                      <label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Phone Number</label>
                      <input 
                        type='tel' 
                        name='phone'
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        placeholder='10-digit mobile number'
                        className='border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200 font-medium'
                        required
                      />
                    </div>
                  </div>

                  {/* Save to profile checkbox */}
                  <div className='flex items-center gap-2.5 mt-2'>
                    <input 
                      type='checkbox' 
                      id='saveToProfile'
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className='w-4.5 h-4.5 rounded border-gray-300 text-black focus:ring-black'
                    />
                    <label htmlFor='saveToProfile' className='text-xs font-semibold text-gray-600 select-none cursor-pointer'>
                      Save this address as default in my profile
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Box */}
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5'>
              <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-4'>
                <span className='w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center'>2</span>
                Payment Method
              </h2>

              {/* Selector cards */}
              <div className='grid grid-cols-2 gap-4'>
                {[
                  { id: 'COD', title: 'Cash on Delivery', desc: 'Pay on delivery' },
                  { id: 'Razorpay', title: 'Online Payment (Razorpay)', desc: 'Card, UPI, Netbanking' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type='button'
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 border rounded-xl flex flex-col gap-1.5 text-left transition-all duration-200 cursor-pointer ${
                      paymentMethod === pm.id 
                        ? 'border-black bg-gray-50/50 ring-2 ring-black/5 font-bold' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className='text-xs font-bold text-gray-800'>{pm.title}</span>
                    <span className='text-[10px] text-gray-400 font-semibold'>{pm.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </form>

          {/* RIGHT: Order Summary Card */}
          <div className='lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-6 lg:sticky lg:top-8'>
            <h2 className='text-xl font-bold text-gray-800 border-b pb-4'>Order Summary</h2>

            {/* Cart Items List */}
            <div className='flex flex-col gap-4 max-h-72 overflow-y-auto pr-1'>
              {cart.items.map((item, index) => (
                <div key={index} className='flex gap-3 items-center border-b border-gray-50 pb-3 last:border-b-0 last:pb-0'>
                  <img 
                    src={item.image || 'https://via.placeholder.com/60'} 
                    alt={item.productName} 
                    className='w-12 h-12 object-cover rounded-lg border bg-gray-50'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-xs font-bold text-gray-800 truncate'>{item.productName}</h3>
                    <p className='text-[10px] text-gray-400 font-semibold'>
                      Size: <span className='text-gray-600'>{item.size}</span> | Qty: <span className='text-gray-600'>{item.quantity}</span>
                    </p>
                  </div>
                  <span className='text-xs font-extrabold text-gray-900 shrink-0'>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations details */}
            <div className='flex flex-col gap-3 bg-gray-50 p-4 rounded-xl text-sm border'>
              <div className='flex justify-between text-gray-600 font-semibold'>
                <span>Subtotal</span>
                <span className='text-gray-800'>₹{cart.subtotal}</span>
              </div>
              <div className='flex justify-between text-gray-600 font-semibold border-b pb-3'>
                <span>Shipping</span>
                <span className='text-green-600 font-bold'>FREE</span>
              </div>
              <div className='flex justify-between text-base font-black text-gray-950 pt-1'>
                <span>Order Total</span>
                <span>₹{cart.total}</span>
              </div>
            </div>

            {/* Place Order submit button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || cart.items.length === 0}
              className='w-full py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-150 cursor-pointer disabled:bg-gray-300 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Order...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Confirm & Place Order
                </>
              )}
            </button>

            <p className='text-[10px] text-gray-400 font-semibold text-center select-none'>
              By clicking the button, you agree to our Terms of Service & Privacy Policy. Payments are processed securely.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout
