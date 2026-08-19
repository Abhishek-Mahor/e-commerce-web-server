import React, { useState } from 'react'
import axios from 'axios'

const UserAddressForm = ({ onAddressUpdated }) => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({
    state: "",
    city: "",
    zipCode: "",
    address: "",
    phone: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { state, city, zipCode, address, phone } = form;

  const handle = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Clear alerts on user input
    if (error) setError("");
    if (success) setSuccess("");
  };
    
  const Address = async (e) => {
    e.preventDefault();
    if (!state || !city || !zipCode || !address || !phone) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backend_url}/api/address/addAddress`,
        { state, city, zipCode, address, phone },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess("Address saved successfully!");
      setForm({
        state: "",
        city: "",
        zipCode: "",
        address: "",
        phone: ""
      });

      if (onAddressUpdated && response.data.address) {
        onAddressUpdated(response.data.address);
      }
    } catch (err) {
      console.error("Failed to add address:", err);
      setError(err.response?.data?.message || "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-lg transition-all duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">Add Shipping Address</h2>
      
      <form onSubmit={Address} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-xs font-semibold p-3 rounded-lg border border-green-100">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Street Address</label>
          <input 
            type="text" 
            name="address"
            value={address} 
            onChange={handle}
            className="border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200" 
            placeholder="House / Apartment no, street name" 
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">City</label>
            <input 
              type="text" 
              name="city"
              value={city} 
              onChange={handle}
              className="border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200" 
              placeholder="e.g. Mumbai" 
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">State</label>
            <input 
              type="text" 
              name="state"
              value={state} 
              onChange={handle}
              className="border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200" 
              placeholder="e.g. Maharashtra" 
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zip Code</label>
            <input 
              type="text" 
              name="zipCode"
              value={zipCode} 
              onChange={handle}
              className="border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200" 
              placeholder="e.g. 400001" 
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
            <input 
              type="tel" 
              name="phone"
              value={phone} 
              onChange={handle}
              className="border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 p-3 rounded-xl w-full text-sm outline-none transition-all duration-200" 
              placeholder="10-digit mobile number" 
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-md transition-all duration-150 cursor-pointer disabled:bg-gray-400 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Address"
          )}
        </button>
      </form>
    </div>
  )
}

export default UserAddressForm