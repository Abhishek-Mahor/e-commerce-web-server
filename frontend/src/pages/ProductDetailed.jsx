import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'


const ProductDetailed = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();   
  const [product, setProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const {user,setUser}=useContext(AuthContext)
  const { addToCart } = useContext(CartContext)
  const [selectedSize, setSelectedSize] = useState('Default')

  useEffect(() => {
    if (id) {
      axios.get(`${backend_url}/api/products/${id}`,{}).then(res => {
        setProduct(res.data)
        if (res.data.size) {
          const sizes = res.data.size.split(',').map(s => s.trim());
          if (sizes.length > 0) {
            setSelectedSize(sizes[0]);
          }
        }
      }).catch(err => console.log(err)) 
    }
  }, [id])



  if (!product) {
    return (
      <div className='text-center mt-10'>
        <p className='text-xl text-red-500'>Product not found</p>
        <button 
          onClick={() => navigate('/')}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
        >
          Back to Home
        </button>
      </div>
    )
  }
  
  const handleAddToCart = async () => {
    if (user == null) {
      navigate('/signin')
      return
    }

    const success = await addToCart(product._id, 1, selectedSize)
    if (success) {
      setShowPopup(true)
      setTimeout(() => {
        setShowPopup(false)
      }, 2000)
    } else {
      alert('Failed to add product to cart. Your session may have expired. Please sign in again.')
      navigate('/signin')
    }
  }

  return (
    <div>
      <Header />
      <div className='container mx-auto p-8'>
        
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Product Image */}
          <div className='flex justify-center items-center'>
            <img 
              src={product.image} 
              alt={product.productName || product.name}
              className='w-96 h-96 object-cover rounded-lg shadow-lg'
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className='text-4xl font-bold mb-4'>{product.productName || product.name}</h1>
            
            <div className='mb-6'>
              <p className='text-2xl text-gray-700 font-bold'>₹{product.price}</p>
            </div>

            <div className='mb-6'>
              <p className='text-lg text-gray-600'>
                <span className='font-semibold'>Color:</span> {product.productColor || product.color || "Default"}
              </p>
            </div>

            <div className='mb-6'>
              <p className='text-lg text-gray-600 mb-2'><span className='font-semibold'>Select Size:</span></p>
              <div className='flex gap-2 flex-wrap'>
                {product.size ? (
                  product.size.split(',').map(s => s.trim()).map(sz => (
                    <button
                      key={sz}
                      type='button'
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 border rounded-md text-sm font-semibold transition cursor-pointer ${
                        selectedSize === sz 
                          ? 'bg-black text-white border-black shadow-sm' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))
                ) : (
                  <span className='text-gray-500'>Default</span>
                )}
              </div>
            </div>

            <div className='mb-6'>
               
              
                {showPopup && (
                  <div className='h-5 w-40 mb-3 bg-green-100 text-center  text-green-700  rounded-lg  animate-bounce'>
                    <p className='text-sm font-medium '>Item added to cart!</p>
                  </div>
                )}

              <button onClick={handleAddToCart} className='px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-lg'>
                Add to Cart
              </button>
            </div>

            <div className='border-t pt-6'>
              <h3 className='text-xl font-semibold mb-2'>Product Description</h3>
              <p className='text-gray-600'>
                High-quality {product.productName || product.name} in {product.productColor || product.color || "Default"} color. 
                Perfect for everyday wear. Available at ₹{product.price}.
              </p>
              
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default ProductDetailed