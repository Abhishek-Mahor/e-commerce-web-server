import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import ProductDetailed from '../pages/ProductDetailed'
import Cart from '../pages/Cart'
import Signin from '../pages/Signin'
import Signup from '../pages/Signup'
import AdminLogin from '../pages/AdminLogin'
import Dashboard from '../pages/Dashboard'
import Checkout from '../pages/Checkout'
import OrderSuccess from '../pages/OrderSuccess'
import Orders from '../pages/Orders'
import AIStylist from '../pages/AIStylist'

const AppRoutes = () => {
  return (
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/product/:id' element={<ProductDetailed />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/order-success/:orderId' element={<OrderSuccess />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/ai-stylist' element={<AIStylist />} />


        {/* Admin routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<Dashboard />} />
      </Routes>
  )
}

export default AppRoutes