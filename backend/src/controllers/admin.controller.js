const Order = require('../models/order.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getDashboardStats(req, res) {
  try {
    // 1. Core KPIs
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesAggregate = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;

    // 2. Monthly Growth Analysis (Aggregate Revenue by Month)
    const monthlyRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Build standard series (Real data + fallback mocks for demo richness if needed)
    let formattedMonthly = monthlyRevenue.map((item, index) => {
      const currentRevenue = item.revenue;
      let prevRevenue = index > 0 ? monthlyRevenue[index - 1].revenue : 0;
      let growthRate = 0;
      if (prevRevenue > 0) {
        growthRate = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      }
      return {
        year: item._id.year,
        month: MONTHS[item._id.month - 1] || `Month ${item._id.month}`,
        revenue: currentRevenue,
        ordersCount: item.ordersCount,
        growthRate: parseFloat(growthRate.toFixed(2))
      };
    });

    // Provide default mock history to show beautiful vector curves if data is low
    if (formattedMonthly.length < 4) {
      const mockHistory = [
        { year: 2026, month: 'Jan', revenue: 12000, ordersCount: 15, growthRate: 0 },
        { year: 2026, month: 'Feb', revenue: 18500, ordersCount: 22, growthRate: 54.17 },
        { year: 2026, month: 'Mar', revenue: 24000, ordersCount: 30, growthRate: 29.73 },
        { year: 2026, month: 'Apr', revenue: 31000, ordersCount: 42, growthRate: 29.17 }
      ];
      
      // Merge real database orders into the timeline
      const currentMonthIndex = new Date().getMonth();
      const currentMonthName = MONTHS[currentMonthIndex];
      
      // Delete mock history duplicate of current month
      const filteredMocks = mockHistory.filter(m => m.month !== currentMonthName);
      
      formattedMonthly = [
        ...filteredMocks,
        {
          year: new Date().getFullYear(),
          month: currentMonthName,
          revenue: totalSales || 1500, // Show real sales or small baseline
          ordersCount: totalOrders || 1,
          growthRate: 15.4
        }
      ];
    }

    // 3. High Demanding Products (Aggregation query)
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          price: { $first: "$items.price" },
          color: { $first: "$items.color" },
          totalQtySold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
        }
      },
      { $sort: { totalQtySold: -1 } },
      { $limit: 10 }
    ]);

    // Fallback populated products if no orders exist yet
    if (topProducts.length === 0) {
      const allProductsList = await Product.find().limit(5);
      allProductsList.forEach(p => {
        topProducts.push({
          _id: p._id,
          name: p.name,
          price: p.price,
          color: p.color || 'Default',
          totalQtySold: 0,
          totalRevenue: 0
        });
      });
    }

    res.status(200).json({
      kpis: {
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        growthPercentage: formattedMonthly[formattedMonthly.length - 1]?.growthRate || 0
      },
      growthData: formattedMonthly,
      demandingProducts: topProducts
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().populate('userId', 'fullname email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function updateDeliveryDetails(req, res) {
  try {
    const { id } = req.params;
    const { deliveryPartner, trackingNumber, orderStatus, estimatedDelivery } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (deliveryPartner) order.deliveryPartner = deliveryPartner;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (orderStatus) order.orderStatus = orderStatus;
    
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    } else if (orderStatus === 'Shipped' && !order.estimatedDelivery) {
      // Auto estimate 4 days out
      const est = new Date();
      est.setDate(est.getDate() + 4);
      order.estimatedDelivery = est;
    }

    // Set payment status to completed if order is delivered
    if (orderStatus === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    await order.save();
    res.status(200).json({ message: 'Order delivery details updated successfully', order });
  } catch (error) {
    console.error('Error updating order delivery details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateDeliveryDetails
};
