import React, { useState, useEffect } from 'react';

function OrderApprovalPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load orders on component mount
    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:3000/api/orders');
            
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
            console.log('✅ Orders loaded:', data.length);

        } catch (err) {
            console.error('❌ Error loading orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(orderId) {
        if (!window.confirm('Are you sure you want to approve this order?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve order');
            }

            const data = await response.json();
            console.log('✅ Order approved:', data);

            alert('✅ Order approved successfully!');

            // Reload orders
            loadOrders();

        } catch (err) {
            console.error('❌ Error approving order:', err);
            alert('❌ Failed to approve order: ' + err.message);
        }
    }

    async function handleDecline(orderId) {
        if (!window.confirm('Are you sure you want to decline this order?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}/decline`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to decline order');
            }

            const data = await response.json();
            console.log('❌ Order declined:', data);

            alert('❌ Order declined successfully.');

            // Reload orders
            loadOrders();

        } catch (err) {
            console.error('❌ Error declining order:', err);
            alert('❌ Failed to decline order: ' + err.message);
        }
    }

    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    // Filter only pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending');

    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading pending orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error Loading Orders</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        <button className="btn btn-danger" onClick={loadOrders}>
                            Try Again
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container my-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2>Order Approval Dashboard</h2>
                        <p className="text-muted">Admin Interface - Approve or Decline Customer Orders</p>
                    </div>
                    <button className="btn btn-outline-primary" onClick={loadOrders}>
                        🔄 Refresh
                    </button>
                </div>

                <div className="alert alert-info mb-4">
                    <strong>{pendingOrders.length}</strong> pending order(s) awaiting approval
                </div>

                {pendingOrders.length === 0 ? (
                    <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">All Caught Up! 🎉</h4>
                        <p>No pending orders at this time.</p>
                        <hr />
                        <p className="mb-0">
                            All orders have been processed. Check back later for new orders.
                        </p>
                    </div>
                ) : (
                    pendingOrders.map(order => (
                        <div key={order.orderId} className="card mb-4">
                            <div className="card-header bg-warning">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Order #{order.orderId}</h5>
                                        <small className="text-muted">
                                            ⏳ Pending Approval - Submitted {formatDate(order.timestamp)}
                                        </small>
                                    </div>
                                    <div>
                                        <span className="badge bg-warning text-dark">Pending</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Customer Information */}
                                    <div className="col-md-6 mb-3">
                                        <h6>Customer Information:</h6>
                                        <p className="mb-1">
                                            <strong>Name:</strong> {order.shipping.firstName} {order.shipping.lastName}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Email:</strong> {order.shipping.email}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Phone:</strong> {order.shipping.phone}
                                        </p>

                                        <h6 className="mt-3">Shipping Address:</h6>
                                        <p className="mb-0">
                                            {order.shipping.address.line1}<br />
                                            {order.shipping.address.line2 && (
                                                <>{order.shipping.address.line2}<br /></>
                                            )}
                                            {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}
                                        </p>
                                    </div>

                                    {/* Order Details */}
                                    <div className="col-md-6 mb-3">
                                        <h6>Order Details:</h6>
                                        <p className="mb-1">
                                            <strong>Order Date:</strong> {formatDate(order.timestamp)}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Payment Method:</strong> {order.payment.method}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Total Amount:</strong> <span className="text-success fw-bold">${order.total.toFixed(2)}</span>
                                        </p>

                                        <h6 className="mt-3">Items ({order.items.length}):</h6>
                                        <ul className="list-unstyled">
                                            {order.items.map((item, index) => (
                                                <li key={index} className="mb-1">
                                                    <small>
                                                        {item.title} × {item.quantity} - ${item.subtotal.toFixed(2)}
                                                    </small>
                                                </li>
                                            ))}
                                        </ul>

                                        {order.specialInstructions && (
                                            <>
                                                <h6 className="mt-3">Special Instructions:</h6>
                                                <p className="text-muted small mb-0">
                                                    {order.specialInstructions}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <hr />

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button 
                                        className="btn btn-success btn-lg"
                                        onClick={() => handleApprove(order.orderId)}
                                    >
                                        ✅ Approve Order
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-lg"
                                        onClick={() => handleDecline(order.orderId)}
                                    >
                                        ❌ Decline Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2026 StoreFront | IST 256 Group Project</p>
            </footer>
        </>
    );
}

export default OrderApprovalPage;