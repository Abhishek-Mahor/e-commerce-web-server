const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/user.auth.route');
const productRoutes = require('./routes/product.route');
const adminRoutes = require('./routes/admin.route');
const cartRoutes = require('./routes/cart.route');
const orderRoutes = require('./routes/order.route');
const addressRoutes = require('./routes/user.addres.route');
const stylistRoutes = require('./routes/stylist.route');
const cors = require('cors');




const app = express();

// Allowed origins
const allowedOrigins = [             
  "https://e-commerce-st.netlify.app"   // production frontend
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // include OPTIONS
  credentials: true
}));




app.use(cookieParser());
app.use(express.json());  




app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/stylist', stylistRoutes);
app.use('/', adminRoutes);






module.exports = app;