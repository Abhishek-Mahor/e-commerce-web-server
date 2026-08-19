  import { useNavigate } from "react-router-dom"


const ProductCard = ({ id, name, price, description, image }) => {
    const navigate = useNavigate()
 
  return (
    

    
    
    
    
    <div  
      onClick={() => navigate(`/product/${id}`)}
      className='w-45 h-70 bg-white flex flex-col items-center cursor-pointer gap-2 hover:shadow-lg transition-shadow'
    >
        <div className="w-40 h-45 bg-gray-400 mt-3">
          <img className='contain-fit w-40 h-45' src={image} alt={name} />
        </div>
        <div className=''>
            <h3 className='text-lg font-bold'>{name}</h3>
            <p className='text-gray-600'>{description}</p>
            <p className='text-gray-600'>₹{price} </p>
        </div>
  




    </div>
   
  )
}

export default ProductCard