// ============================================
// L10: Node.js Backend with Express
// StoreFront Order Management System
// ============================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to orders.json file
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// ============================================
// Middleware
// ============================================

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// File Storage Helper Functions
// ============================================

function readOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            console.log('📝 orders.json does not exist, creating new file...');
            writeOrders([]);
            return [];
        }
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        const orders = JSON.parse(data);
        console.log(`✅ Read ${orders.length} orders from file`);
        return orders;
    } catch (error) {
        console.error('❌ Error reading orders file:', error);
        return [];
    }
}

function writeOrders(orders) {
    try {
        const data = JSON.stringify(orders, null, 2);
        fs.writeFileSync(ORDERS_FILE, data, 'utf8');
        console.log(`💾 Saved ${orders.length} orders to file`);
    } catch (error) {
        console.error('❌ Error writing orders file:', error);
    }
}

function findOrderById(orderId) {
    const orders = readOrders();
    return orders.find(order => order.orderId === orderId) || null;
}

// ============================================
// REST API Endpoints
// ============================================

// Create order
app.post('/api/orders', (req, res) => {
    try {
        const orders = readOrders();
        const newOrder = {
            orderId: 'ORD-' + Date.now(),
            ...req.body,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        orders.push(newOrder);
        writeOrders(orders);
        console.log('✅ New order created:', newOrder.orderId);
        res.status(201).json({
            success: true,
            orderId: newOrder.orderId,
            message: 'Order received and pending approval'
        });
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
});

// Get all orders
app.get('/api/orders', (req, res) => {
    try {
        let orders = readOrders();
        const statusFilter = req.query.status;
        if (statusFilter) {
            orders = orders.filter(order => order.status === statusFilter);
            console.log(`📋 Returning ${orders.length} orders with status: ${statusFilter}`);
        } else {
            console.log(`📋 Returning all ${orders.length} orders`);
        }
        res.json(orders);
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

// Get single order
app.get('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = findOrderById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        console.log('📦 Returning order:', orderId);
        res.json(order);
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
});

// Approve order
app.put('/api/orders/:orderId/approve', (req, res) => {
    try {
        const { orderId } = req.params;
        const orders = readOrders();
        const orderIndex = orders.findIndex(order => order.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        orders[orderIndex].status = 'approved';
        orders[orderIndex].approvedAt = new Date().toISOString();
        writeOrders(orders);
        console.log('✅ Order approved:', orderId);
        res.json({
            success: true,
            message: 'Order approved successfully',
            order: orders[orderIndex]
        });
    } catch (error) {
        console.error('❌ Error approving order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve order'
        });
    }
});

// Decline order
app.put('/api/orders/:orderId/decline', (req, res) => {
    try {
        const { orderId } = req.params;
        const orders = readOrders();
        const orderIndex = orders.findIndex(order => order.orderId === orderId);
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        orders[orderIndex].status = 'declined';
        orders[orderIndex].declinedAt = new Date().toISOString();
        writeOrders(orders);
        console.log('❌ Order declined:', orderId);
        res.json({
            success: true,
            message: 'Order declined successfully',
            order: orders[orderIndex]
        });
    } catch (error) {
        console.error('❌ Error declining order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to decline order'
        });
    }
});

// Delete order (optional)
app.delete('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        let orders = readOrders();
        const orderExists = orders.some(order => order.orderId === orderId);
        if (!orderExists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        orders = orders.filter(order => order.orderId !== orderId);
        writeOrders(orders);
        console.log('🗑️ Order deleted:', orderId);
        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order'
        });
    }
});

// ============================================
// Serve React Frontend in Production
// ============================================

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route - serve React app for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('💥 Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 StoreFront Backend Server');
    console.log('========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Orders file: ${ORDERS_FILE}`);
    console.log('========================================');
});