// ============================================
// L10: Node.js Backend with Express
// StoreFront Order Management System
// Works for both local development and production (Render.com)
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

/**
 * Read orders from JSON file
 * @returns {Array} Array of order objects
 */
function readOrders() {
    try {
        // Check if file exists
        if (!fs.existsSync(ORDERS_FILE)) {
            console.log('📝 orders.json does not exist, creating new file...');
            writeOrders([]);
            return [];
        }

        // Read file contents
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        
        // Parse JSON
        const orders = JSON.parse(data);
        console.log(`✅ Read ${orders.length} orders from file`);
        return orders;
    } catch (error) {
        console.error('❌ Error reading orders file:', error);
        return [];
    }
}

/**
 * Write orders to JSON file
 * @param {Array} orders - Array of order objects to save
 */
function writeOrders(orders) {
    try {
        // Convert to JSON with pretty formatting
        const data = JSON.stringify(orders, null, 2);
        
        // Write to file
        fs.writeFileSync(ORDERS_FILE, data, 'utf8');
        console.log(`💾 Saved ${orders.length} orders to file`);
    } catch (error) {
        console.error('❌ Error writing orders file:', error);
    }
}

/**
 * Find order by ID
 * @param {string} orderId - Order ID to find
 * @returns {Object|null} Order object or null if not found
 */
function findOrderById(orderId) {
    const orders = readOrders();
    return orders.find(order => order.orderId === orderId) || null;
}

// ============================================
// REST API Endpoints
// ============================================

/**
 * POST /api/orders
 * Create a new order
 */
app.post('/api/orders', (req, res) => {
    try {
        // Read existing orders
        const orders = readOrders();

        // Create new order with initial status
        const newOrder = {
            orderId: 'ORD-' + Date.now(),
            ...req.body,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Add to orders array
        orders.push(newOrder);

        // Save to file
        writeOrders(orders);

        console.log('✅ New order created:', newOrder.orderId);

        // Send response
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

/**
 * GET /api/orders
 * Get all orders (with optional status filter)
 */
app.get('/api/orders', (req, res) => {
    try {
        // Read orders from file
        let orders = readOrders();

        // Optional: Filter by status
        const statusFilter = req.query.status;
        if (statusFilter) {
            orders = orders.filter(order => order.status === statusFilter);
            console.log(`📋 Returning ${orders.length} orders with status: ${statusFilter}`);
        } else {
            console.log(`📋 Returning all ${orders.length} orders`);
        }

        // Send response
        res.json(orders);

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

/**
 * GET /api/orders/:orderId
 * Get a single order by ID
 */
app.get('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
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

/**
 * PUT /api/orders/:orderId/approve
 * Approve an order
 */
app.put('/api/orders/:orderId/approve', (req, res) => {
    try {
        const { orderId } = req.params;

        // Read all orders
        const orders = readOrders();

        // Find order index
        const orderIndex = orders.findIndex(order => order.orderId === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        orders[orderIndex].status = 'approved';
        orders[orderIndex].approvedAt = new Date().toISOString();

        // Save to file
        writeOrders(orders);

        console.log('✅ Order approved:', orderId);

        // Send response
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

/**
 * PUT /api/orders/:orderId/decline
 * Decline an order
 */
app.put('/api/orders/:orderId/decline', (req, res) => {
    try {
        const { orderId } = req.params;

        // Read all orders
        const orders = readOrders();

        // Find order index
        const orderIndex = orders.findIndex(order => order.orderId === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        orders[orderIndex].status = 'declined';
        orders[orderIndex].declinedAt = new Date().toISOString();

        // Save to file
        writeOrders(orders);

        console.log('❌ Order declined:', orderId);

        // Send response
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

/**
 * DELETE /api/orders/:orderId
 * Delete an order (optional - for testing/cleanup)
 */
app.delete('/api/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;

        // Read all orders
        let orders = readOrders();

        // Find order
        const orderExists = orders.some(order => order.orderId === orderId);

        if (!orderExists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Remove order
        orders = orders.filter(order => order.orderId !== orderId);

        // Save to file
        writeOrders(orders);

        console.log('🗑️ Order deleted:', orderId);

        // Send response
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
// Serve React Frontend (Production)
// ============================================

// ============================================
// Serve React Frontend (Production)
// ============================================

// Check if dist folder exists (production build)
const distPath = path.join(__dirname, 'dist');
const distExists = fs.existsSync(distPath);

if (distExists) {
    console.log('📦 Serving React build from dist/ folder');
    
    // Serve static files from dist folder
    app.use(express.static(distPath));
    
    // Catch-all for React Router - serve index.html for any non-API route
    app.use((req, res, next) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        } else {
            next();
        }
    });
} else {
    console.log('⚠️  dist/ folder not found');
    console.log('   For local development: Run "npm start" in another terminal');
    console.log('   For production: Run "npm run build" first');
}

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 StoreFront Backend Server');
    console.log('========================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Orders file: ${ORDERS_FILE}`);
    console.log('');
    console.log('📡 API Endpoints:');
    console.log(`   POST   http://localhost:${PORT}/api/orders`);
    console.log(`   GET    http://localhost:${PORT}/api/orders`);
    console.log(`   GET    http://localhost:${PORT}/api/orders/:orderId`);
    console.log(`   PUT    http://localhost:${PORT}/api/orders/:orderId/approve`);
    console.log(`   PUT    http://localhost:${PORT}/api/orders/:orderId/decline`);
    console.log(`   DELETE http://localhost:${PORT}/api/orders/:orderId`);
    console.log('========================================');
    
    if (!distExists) {
        console.log('');
        console.log('💡 Tip: To serve the React app from this server:');
        console.log('   1. Run: npm run build');
        console.log('   2. Restart server: npm run server');
        console.log('========================================');
    }
});