import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Searchbar = ({className}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    // Update the search param immediately as they type
    if (val.trim()) {
      navigate(`/?search=${encodeURIComponent(val.trim())}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    
  };


    //page reload block
  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSearch} className='flex border border-gray-300 shadow-sm rounded-lg  bg-white overflow-hidden max-w-sm w-full'>
      <input 
        className={`'px-4 py-1.5 rounded-l-lg w-full border-none focus:outline-none text-sm ${className}  ' `}
        placeholder='Search products...' 
        type="text" 
        value={query}
        onChange={handleInputChange}
      />
      <button type="submit" className='px-3 bg-gray-50 hover:bg-gray-100 border-l text-gray-500 hover:text-black cursor-pointer transition-colors duration-150'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </button>
    </form>
  )
}

export default Searchbar