import React, { useState, useEffect } from 'react'
import axios from 'axios'
const backend_url = import.meta.env.VITE_BACKEND_URL;

const AdminProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    description: '',
    size: '',
    color: ''
  });

  const token = localStorage.getItem('adminToken');
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend_url}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to retrieve products catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      image: '',
      description: '',
      size: '',
      color: ''
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      description: product.description,
      size: product.size,
      color: product.color
    });
    setError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, price, stock, description, size, color } = formData;
    if (!name || !price || !stock || !description || !size || !color) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (isEditing) {
        // Update product
        const res = await axios.put(
          `${backend_url}/admin/products/${currentProductId}`,
          formData,
          getAuthHeaders()
        );
        alert('Product modified successfully!');
        setProducts(products.map(p => p._id === currentProductId ? res.data.product : p));
      } else {
        // Create product
        const res = await axios.post(
          `${backend_url}/admin/products`,
          formData,
          getAuthHeaders()
        );
        alert('Product added to catalog successfully!');
        setProducts([...products, res.data.product]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit product form:', err);
      setError(err.response?.data?.message || 'Error processing request.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${backend_url}/admin/products/${id}`, getAuthHeaders());
      alert('Product deleted successfully.');
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex flex-col gap-6'>
      
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border shadow-sm'>
        <input 
          type="text" 
          placeholder="Search catalog products..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-full sm:w-80 border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
        />
        <button
          onClick={openAddModal}
          className='w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition shadow-sm cursor-pointer'
        >
          + Add New Product
        </button>
      </div>

      {loading ? (
        <div className='text-center py-10'>
          <p className='text-sm text-gray-500'>Loading products list...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='text-center py-10 bg-white border rounded-xl'>
          <p className='text-sm text-gray-500'>No products found in the catalog.</p>
        </div>
      ) : (
        <div className='bg-white rounded-xl border shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm border-collapse'>
              <thead>
                <tr className='border-b bg-gray-50 font-bold text-gray-500 uppercase text-xs'>
                  <th className='p-4'>Image</th>
                  <th className='p-4'>Name</th>
                  <th className='p-4'>Price</th>
                  <th className='p-4 text-center'>Specs</th>
                  <th className='p-4 text-center'>Stock</th>
                  <th className='p-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLowStock = p.stock < 10;
                  return (
                    <tr key={p._id} className='border-b last:border-0 hover:bg-slate-50 transition-colors'>
                      <td className='p-4'>
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'} 
                          alt={p.name} 
                          className='w-12 h-16 object-cover rounded bg-gray-100 border'
                        />
                      </td>
                      <td className='p-4'>
                        <p className='font-bold text-slate-800 text-base'>{p.name}</p>
                        <p className='text-xs text-gray-400 truncate max-w-xs'>{p.description}</p>
                      </td>
                      <td className='p-4 font-extrabold text-slate-900'>₹{p.price}</td>
                      <td className='p-4 text-center text-xs text-gray-600 font-medium'>
                        Size: <span className='font-bold'>{p.size}</span> | Color: <span className='font-bold'>{p.color}</span>
                      </td>
                      <td className='p-4 text-center'>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isLowStock ? 'bg-red-100 text-red-700 font-bold animate-pulse' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.stock} {isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className='p-4 text-right'>
                        <div className='flex justify-end gap-3'>
                          <button
                            onClick={() => openEditModal(p)}
                            className='p-1.5 border hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer'
                            title="Edit Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className='p-1.5 border hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer'
                            title="Delete Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn'>
          <div className='bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border animate-scaleIn flex flex-col max-h-[90vh]'>
            
            <div className='flex justify-between items-center border-b pb-3 mb-4'>
              <h3 className='text-xl font-bold text-slate-800'>
                {isEditing ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className='p-1 hover:bg-gray-100 rounded-lg cursor-pointer'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className='bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-xs font-semibold mb-4'>
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className='flex-1 flex flex-col gap-4 overflow-y-auto pr-1'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Product Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Classic T-shirt"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="599"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="50"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Size (e.g. S, M, L) *</label>
                  <input 
                    type="text" 
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="M"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Color *</label>
                  <input 
                    type="text" 
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Black"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>

                <div className='col-span-2'>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Image URL</label>
                  <input 
                    type="text" 
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                  />
                </div>

                <div className='col-span-2'>
                  <label className='block text-xs font-bold text-gray-500 uppercase mb-1'>Description *</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="High-quality classic fit shirt perfect for everyday wear."
                    rows="3"
                    className='w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black'
                    required
                  />
                </div>
              </div>

              <div className='border-t pt-4 mt-2 flex gap-3 justify-end'>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className='px-5 py-2.5 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className='px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-lg text-sm transition shadow cursor-pointer'
                >
                  {isEditing ? 'Save Product' : 'Add Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsManager
