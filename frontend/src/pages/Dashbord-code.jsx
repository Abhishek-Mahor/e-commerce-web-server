import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AdminProductsManager from '../components/AdminProductsManager'

const Dashboard = () => {
   const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, add_product
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    kpis: { totalSales: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0, growthPercentage: 0 },
    growthData: [],
    demandingProducts: []
  });

  // Orders data
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // High demanding products filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodMinQty, setProdMinQty] = useState(0);
  const [prodSortBy, setProdSortBy] = useState('qty'); // qty, revenue

  // Orders filters & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Delivery update form states
  const [carrier, setCarrier] = useState('None');
  const [trackingNo, setTrackingNo] = useState('');
  const [orderStatusVal, setOrderStatusVal] = useState('Pending');
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  const token = localStorage.getItem('adminToken');

  // Helper for auth headers
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const getPayload = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const fetchData = async () => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const payload = getPayload(token);
    if (!payload || payload.role !== 'admin') {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${backend_url}/admin/stats`, getAuthHeaders()),
        axios.get(`${backend_url}/admin/orders`, getAuthHeaders())
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch dashboard records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Set form values when an order is selected
  useEffect(() => {
    if (selectedOrder) {
      setCarrier(selectedOrder.deliveryPartner || 'None');
      setTrackingNo(selectedOrder.trackingNumber || '');
      setOrderStatusVal(selectedOrder.orderStatus || 'Pending');
    }
  }, [selectedOrder]);

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingDelivery(true);

    try {
      const response = await axios.put(
        `${backend_url}/admin/orders/${selectedOrder._id}/delivery`,
        {
          deliveryPartner: carrier,
          trackingNumber: trackingNo,
          orderStatus: orderStatusVal
        },
        getAuthHeaders()
      );

      alert('Order tracking details updated successfully!');
      
      // Update local state
      setOrders(orders.map(o => o._id === selectedOrder._id ? response.data.order : o));
      setSelectedOrder(response.data.order);
      
      // Refresh KPIs/charts if status changed to Delivered
      if (orderStatusVal === 'Delivered' || orderStatusVal === 'Cancelled') {
        const statsRes = await axios.get(`${backend_url}/admin/stats`, getAuthHeaders());
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to update delivery:', err);
      alert(err.response?.data?.message || 'Error updating order details.');
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Generate printable PDF-styled HTML Invoice
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Pop-up blocker is preventing invoice generation. Please enable popups.');
      return;
    }

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const itemsRows = order.items.map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; text-align: left; font-size: 14px;">${idx + 1}</td>
        <td style="padding: 12px 0; text-align: left; font-size: 14px;">
          <strong style="color: #1e293b;">${item.name}</strong><br>
          <span style="font-size: 12px; color: #64748b;">Size: ${item.size} | Color: ${item.color || 'Default'}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px;">₹${item.price}</td>
        <td style="padding: 12px 0; text-align: center; font-size: 14px;">${item.qty}</td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: bold; color: #1e293b;">₹${item.price * item.qty}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .title { text-align: right; }
            .title h1 { margin: 0; font-size: 32px; font-weight: 700; color: #0f172a; }
            .title p { margin: 5px 0 0 0; font-size: 14px; color: #64748b; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .details-box h3 { margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
            .details-box p { margin: 3px 0; font-size: 14px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { border-bottom: 2px solid #e2e8f0; padding: 12px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; font-size: 14px; }
            .totals div { display: flex; width: 250px; justify-content: space-between; }
            .grand-total { font-size: 18px; font-weight: 800; color: #0f172a; border-top: 1px solid #94a3b8; padding-top: 10px; margin-top: 5px; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 80px; border-t: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">E-COMMERCE</div>
            <div class="title">
              <h1>INVOICE</h1>
              <p>Invoice #: ${order._id}</p>
              <p>Date: ${dateStr}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-box">
              <h3>Billed To:</h3>
              <p><strong>${order.shippingAddress.name}</strong></p>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
              <p>Phone: ${order.shippingAddress.phone}</p>
            </div>
            <div class="details-box" style="text-align: right;">
              <h3>Payment & Shipments:</h3>
              <p>Payment Method: <strong>${order.paymentMethod}</strong></p>
              <p>Payment Status: <strong>${order.paymentStatus}</strong></p>
              <p>Delivery Partner: <strong>${order.deliveryPartner || 'None'}</strong></p>
              ${order.trackingNumber ? `<p>Tracking #: <strong>${order.trackingNumber}</strong></p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: left;">#</th>
                <th style="width: 55%; text-align: left;">Item Description</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>₹${order.subtotal}</span>
            </div>
            <div>
              <span>Shipping Fee:</span>
              <span style="color: #16a34a; font-weight: 500;">Free</span>
            </div>
            <div class="grand-total">
              <strong>Total Amount:</strong>
              <strong>₹${order.totalAmount}</strong>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact billing@ecommerce.com</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing dialogue finishes
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // ------------------------------
  // GROWTH CHART SVG GRAPHICS BUILDER
  // ------------------------------
  const renderGrowthChart = () => {
    if (!stats.growthData || stats.growthData.length === 0) return null;

    const maxRevenue = Math.max(...stats.growthData.map(d => d.revenue), 1000);
    const chartHeight = 160;
    const chartWidth = 560;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const drawableWidth = chartWidth - paddingLeft - paddingRight;
    const drawableHeight = chartHeight - paddingTop - paddingBottom;

    // Create line points
    const points = stats.growthData.map((d, i) => {
      const x = paddingLeft + (i / (stats.growthData.length - 1)) * drawableWidth;
      const y = paddingTop + drawableHeight - (d.revenue / maxRevenue) * drawableHeight;
      return { x, y, label: d.month, revenue: d.revenue };
    });

    const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Create fill path under line
    const fillPathString = `
      ${pathString} 
      L ${points[points.length - 1].x} ${paddingTop + drawableHeight} 
      L ${points[0].x} ${paddingTop + drawableHeight} Z
    `;

    return (
      <svg className='w-full overflow-visible' viewBox={`0 0 ${chartWidth} ${chartHeight}`} height={chartHeight}>
        
       

        {/* Shaded Area */}
       

        {/* Spline Path */}
        

        {/* Data points (interactive dots) */}
        
           

            {/* X-axis Month Label */}
           
         
        
      </svg>
    );
  };

  // ------------------------------
  // FILTERS FOR DEMANDING PRODUCTS
  // ------------------------------
  const filteredProducts = stats.demandingProducts
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase());
      const matchQty = p.totalQtySold >= prodMinQty;
      return matchSearch && matchQty;
    })
    .sort((a, b) => {
      if (prodSortBy === 'qty') return b.totalQtySold - a.totalQtySold;
      if (prodSortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
      return 0;
    });

  // ------------------------------
  // FILTERS FOR USER ORDERS
  // ------------------------------
  const filteredOrders = orders.filter(o => {
    const matchIdName = o._id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                        o.shippingAddress.name.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    return matchIdName && matchStatus;
  });

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col md:flex-row'>
      
      {/* Sidebar Navigation */}
      <div className='w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800'>
        <div className='p-6 border-b border-slate-800 flex items-center justify-between'>
          <span className='text-xl font-extrabold tracking-wider text-slate-100 uppercase'>Admin Panel</span>
        </div>

        <nav className='flex-1 p-4 flex flex-col gap-2'>
          <button 
            onClick={() => { setActiveTab('overview'); setSelectedOrder(null); }} 
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
            Overview & Stats
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Manage Orders
          </button>

          <button 
            onClick={() => { setActiveTab('add_product'); setSelectedOrder(null); }} 
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
              activeTab === 'add_product' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Products Catalog
          </button>
        </nav>

        <div className='p-4 border-t border-slate-800'>
          <button 
            onClick={handleLogout} 
            className='w-full py-2.5 px-4 bg-slate-800 hover:bg-red-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3-3H18m-3-3 3 3-3 3" />
            </svg>
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 overflow-y-auto max-h-screen p-8'>
        
        {loading ? (
          <div className='text-center py-20'>
            <p className='text-lg text-gray-500'>Loading dashboard records...</p>
          </div>
        ) : error ? (
          <div className='bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl mb-6 text-sm font-medium'>
            {error}
          </div>
        ) : (
          <div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className='flex flex-col gap-8 animate-fadeIn'>
                <div className='flex justify-between items-center'>
                  <h1 className='text-3xl font-extrabold text-slate-800'>Overview & Analytics</h1>
                  <button onClick={fetchData} className='px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 text-sm font-semibold text-gray-600 transition shadow-sm cursor-pointer'>
                    Refresh
                  </button>
                </div>

                {/* KPI Panels Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-2'>
                    <span className='text-sm text-gray-500 font-semibold uppercase'>Total Sales Revenue</span>
                    <span className='text-3xl font-black text-slate-900'>₹{stats.kpis.totalSales}</span>
                    <span className='text-xs text-green-600 font-bold flex items-center gap-1'>
                      ▲ {stats.kpis.growthPercentage}% MoM Growth
                    </span>
                  </div>

                  <div className='bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-2'>
                    <span className='text-sm text-gray-500 font-semibold uppercase'>Customer Orders</span>
                    <span className='text-3xl font-black text-slate-900'>{stats.kpis.totalOrders}</span>
                    <span className='text-xs text-slate-400 font-semibold'>Total checkout orders processed</span>
                  </div>

                  <div className='bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-2'>
                    <span className='text-sm text-gray-500 font-semibold uppercase'>Active Users</span>
                    <span className='text-3xl font-black text-slate-900'>{stats.kpis.totalUsers}</span>
                    <span className='text-xs text-slate-400 font-semibold'>Registered buyer profiles</span>
                  </div>

                  <div className='bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-2'>
                    <span className='text-sm text-gray-500 font-semibold uppercase'>Products Catalog</span>
                    <span className='text-3xl font-black text-slate-900'>{stats.kpis.totalProducts}</span>
                    <span className='text-xs text-slate-400 font-semibold'>Active catalog SKUs</span>
                  </div>
                </div>

                {/* Analytics Graphs Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                  {/* Growth SVG Graph Card */}
                  <div className='lg:col-span-7 bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4'>
                    <div>
                      <h3 className='text-lg font-bold text-slate-800'>Company Growth Analysis</h3>
                      <p className='text-xs text-gray-500'>MoM growth stats and revenue curves</p>
                    </div>
                    <div className='w-full pt-4'>
                      {renderGrowthChart()}
                    </div>
                  </div>

                  {/* High Demanding Products Card */}
                  <div className='lg:col-span-5 bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h3 className='text-lg font-bold text-slate-800'>Top Demanded Products</h3>
                        <p className='text-xs text-gray-500'>Highest sold items in quantities</p>
                      </div>
                    </div>

                    {/* Filter controls */}
                    <div className='flex flex-wrap gap-2 text-xs'>
                      <input 
                        type="text" 
                        placeholder="Search product..." 
                        value={prodSearch} 
                        onChange={e => setProdSearch(e.target.value)}
                        className='border rounded-lg p-1.5 flex-1 focus:outline-none focus:ring-1 focus:ring-black'
                      />
                      <select 
                        value={prodSortBy} 
                        onChange={e => setProdSortBy(e.target.value)}
                        className='border rounded-lg p-1.5 focus:outline-none focus:ring-1'
                      >
                        <option value="qty">Sort: Qty Sold</option>
                        <option value="revenue">Sort: Revenue</option>
                      </select>
                    </div>

                    {/* Top Products Table */}
                    <div className='overflow-x-auto mt-2 max-h-56 overflow-y-auto pr-1'>
                      <table className='w-full text-left text-xs'>
                        <thead>
                          <tr className='border-b font-bold text-gray-400 uppercase'>
                            <th className='pb-2'>Item</th>
                            <th className='pb-2 text-center'>Sold Qty</th>
                            <th className='pb-2 text-right'>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p, idx) => (
                            <tr key={p._id || idx} className='border-b last:border-b-0'>
                              <td className='py-2.5 font-semibold text-slate-800 truncate max-w-37.5'>{p.name}</td>
                              <td className='py-2.5 text-center font-bold text-slate-900'>{p.totalQtySold}</td>
                              <td className='py-2.5 text-right font-semibold text-gray-600'>₹{p.totalRevenue}</td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan="3" className="text-center py-4 text-gray-400">No products match.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className='animate-fadeIn flex flex-col gap-8'>
                <div className='flex justify-between items-center'>
                  <h1 className='text-3xl font-extrabold text-slate-800'>Manage Orders</h1>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
                  
                  {/* Left Side: Orders Table List */}
                  <div className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-4 ${
                    selectedOrder ? 'lg:col-span-7' : 'lg:col-span-12'
                  }`}>
                    {/* Filters bar */}
                    <div className='flex flex-col sm:flex-row gap-3 justify-between'>
                      <input 
                        type="text" 
                        placeholder="Search order ID or customer name..." 
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        className='border rounded-xl p-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-black'
                      />
                      <select
                        value={orderStatusFilter}
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className='border rounded-xl p-2.5 text-sm bg-white focus:outline-none'
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Orders Table */}
                    <div className='overflow-x-auto'>
                      <table className='w-full text-left text-sm border-collapse'>
                        <thead>
                          <tr className='border-b font-bold text-gray-400 uppercase text-xs'>
                            <th className='pb-3'>Order ID</th>
                            <th className='pb-3'>Customer</th>
                            <th className='pb-3'>Amount</th>
                            <th className='pb-3'>Status</th>
                            <th className='pb-3 text-right'>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((o) => (
                            <tr 
                              key={o._id} 
                              onClick={() => setSelectedOrder(o)}
                              className={`border-b last:border-0 hover:bg-slate-50 cursor-pointer transition ${
                                selectedOrder?._id === o._id ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <td className='py-4 font-mono text-xs font-semibold text-slate-800 truncate max-w[30'>{o._id}</td>
                              <td className='py-4 font-medium text-slate-800'>{o.shippingAddress.name}</td>
                              <td className='py-4 font-bold text-slate-900'>₹{o.totalAmount}</td>
                              <td className='py-4'>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  o.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {o.orderStatus}
                                </span>
                              </td>
                              <td className='py-4 text-right'>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                                  className='text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer'
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-8 text-gray-400 font-medium">
                                No orders found matching filter criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Side: Order Detail Panel & Shipment Integration */}
                  {selectedOrder && (
                    <div className='lg:col-span-5 bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-6 animate-slideIn'>
                      
                      <div className='flex justify-between items-center border-b pb-3'>
                        <div>
                          <h3 className='text-lg font-bold text-slate-800'>Order Details</h3>
                          <span className='font-mono text-xs text-gray-400'>ID: {selectedOrder._id}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedOrder(null)} 
                          className='p-1 hover:bg-gray-100 rounded-lg cursor-pointer'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Delivery Status Progress Tracker pipeline */}
                      <div>
                        <h4 className='text-xs font-semibold text-gray-500 uppercase mb-3'>Delivery Tracking</h4>
                        
                        <div className='flex items-center justify-between text-[10px] font-bold text-gray-400 relative mb-4'>
                          {/* Progress Line */}
                          <div className='absolute left-2 right-2 top-2 h-0.5 bg-gray-200 -z-10'>
                            <div className={`h-full bg-green-500 transition-all duration-300 ${
                              selectedOrder.orderStatus === 'Delivered' ? 'w-full' :
                              selectedOrder.orderStatus === 'Shipped' ? 'w-2/3' :
                              selectedOrder.orderStatus === 'Processing' ? 'w-1/3' : 'w-0'
                            }`} />
                          </div>
                          
                          {/* Step Nodes */}
                          {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                            const isCompleted = 
                              (index === 0) || 
                              (index === 1 && ['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.orderStatus)) ||
                              (index === 2 && ['Shipped', 'Delivered'].includes(selectedOrder.orderStatus)) ||
                              (index === 3 && selectedOrder.orderStatus === 'Delivered');

                            return (
                              <div key={step} className='flex flex-col items-center gap-1.5'>
                                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] ${
                                  isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={isCompleted ? 'text-green-600 font-bold' : ''}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery Partner Integration Settings Form */}
                      <form onSubmit={handleUpdateDelivery} className='bg-gray-50 p-4 rounded-xl border border-dashed flex flex-col gap-4'>
                        <h4 className='text-xs font-bold text-slate-700 uppercase'>Assign Delivery Carrier</h4>
                        
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='block text-[10px] font-semibold text-gray-500 uppercase mb-1'>Delivery Partner</label>
                            <select
                              value={carrier}
                              onChange={e => setCarrier(e.target.value)}
                              className='w-full border bg-white rounded-lg p-2 text-xs focus:outline-none'
                            >
                              <option value="None">None</option>
                              <option value="Shiprocket">Shiprocket</option>
                              <option value="Delhivery">Delhivery</option>
                              <option value="DHL">DHL Express</option>
                            </select>
                          </div>

                          <div>
                            <label className='block text-[10px] font-semibold text-gray-500 uppercase mb-1'>Tracking Number</label>
                            <input 
                              type='text' 
                              placeholder='Tracking ID'
                              value={trackingNo}
                              onChange={e => setTrackingNo(e.target.value)}
                              className='w-full border bg-white rounded-lg p-2 text-xs focus:outline-none'
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3 items-end'>
                          <div>
                            <label className='block text-[10px] font-semibold text-gray-500 uppercase mb-1'>Order Status</label>
                            <select
                              value={orderStatusVal}
                              onChange={e => setOrderStatusVal(e.target.value)}
                              className='w-full border bg-white rounded-lg p-2 text-xs focus:outline-none'
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                          
                          <button
                            type='submit'
                            disabled={updatingDelivery}
                            className='w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer disabled:bg-gray-400'
                          >
                            {updatingDelivery ? 'Updating...' : 'Save & Sync'}
                          </button>
                        </div>
                      </form>

                      {/* Items Details */}
                      <div>
                        <h4 className='text-xs font-semibold text-gray-500 uppercase mb-2'>Ordered Products</h4>
                        <div className='flex flex-col gap-2 max-h-36 overflow-y-auto pr-1'>
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className='flex justify-between items-center text-xs border-b pb-2 last:border-b-0 last:pb-0'>
                              <div className='min-w-0'>
                                <p className='font-bold text-gray-800 truncate'>{item.name}</p>
                                <span className='text-[10px] text-gray-500'>Size: {item.size} | Color: {item.color || 'Default'}</span>
                              </div>
                              <span className='font-bold text-gray-700 shrink-0'>
                                ₹{item.price} x {item.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Address Details */}
                      <div className='text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border'>
                        <h4 className='text-xs font-bold text-slate-700 uppercase mb-2'>Shipping Summary</h4>
                        <p className='font-bold text-slate-800'>{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}</p>
                        <p className='mt-1.5'>Phone: <span className='font-semibold text-slate-800'>{selectedOrder.shippingAddress.phone}</span></p>
                      </div>

                      {/* Action buttons: Invoice Generation */}
                      <div className='flex gap-2 pt-2 border-t'>
                        <button
                          onClick={() => handlePrintInvoice(selectedOrder)}
                          className='flex-1 py-3 border border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 19.164h10.56M16.5 16.5v-1.5m-9 1.5v-1.5m9 0a1.5 1.5 0 0 0-1.5-1.5H9a1.5 1.5 0 0 0-1.5 1.5M16.5 13.5v-3.75A3.75 3.75 0 0 0 12.75 6h-1.5A3.75 3.75 0 0 0 7.5 9.75V13.5m9 0H7.5m9 0v3.75m-9-3.75v3.75m9-.75h.008v.008H16.5v-.008Zm0-3h.008v.008H16.5V9.75Zm0-3h.008v.008H16.5V6.75Z" />
                          </svg>
                          Print PDF Invoice
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB: PRODUCTS CATALOG */}
            {activeTab === 'add_product' && (
              <div className='animate-fadeIn flex flex-col gap-6 w-full'>
                <h1 className='text-3xl font-extrabold text-slate-800 mb-2'>Products Catalog</h1>
                <AdminProductsManager />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard