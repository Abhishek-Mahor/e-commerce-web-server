const express = require("express");
const controller = require("../controllers/admin.auth.controller");
const productcontroller = require("../controllers/admin.product.controller"); 
const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middleware/admin.middleware");

const router = express.Router();

router.post('/admin/login', controller.adminlogin);
router.post('/admin/logout', controller.adminlogout);

// Admin dashboard routes (Protected)
router.post('/admin/products', adminMiddleware, productcontroller.addproduct);
router.put('/admin/products/:id', adminMiddleware, productcontroller.updateproduct);
router.delete('/admin/products/:id', adminMiddleware, productcontroller.deleteproduct);
router.get('/admin/stats', adminMiddleware, adminController.getDashboardStats);
router.get('/admin/orders', adminMiddleware, adminController.getAllOrders);
router.put('/admin/orders/:id/delivery', adminMiddleware, adminController.updateDeliveryDetails);

module.exports = router;

