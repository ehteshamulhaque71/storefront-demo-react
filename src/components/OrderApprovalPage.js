import React, { useState, useEffect } from 'react';

function OrderApprovalPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError(null);

            // Determine API URL based on environment
            const API_URL = window.location.port === '1234' 
                ? 'http://localhost:3000' 
                : '';

            console.log('Fetching from:', API_URL + '/api/orders');

            const response = await fetch(`${API_URL}/api/orders`);
            
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
            // Determine API URL based on environment
            const API_URL = window.location.port === '1234' 
                ? 'http://localhost:3000' 
                : '';

            const response = await fetch(`${API_URL}/api/orders/${orderId}/approve`, {
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
            // Determine API URL based on environment
            const API_URL = window.location.port === '1234' 
                ? 'http://localhost:3000' 
                : '';

            const response = await fetch(`${API_URL}/api/orders/${orderId}/decline`, {
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

    const pendingOrders = orders.filter(order => order.status === 'pending');

    if (loading) {
        return (
            <div className="container my-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error Loading Orders</h4>
                    <p>{error}</p>
                    <button className="btn btn-danger" onClick={loadOrders}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Order Approval Dashboard</h1>
                <button className="btn btn-primary" onClick={loadOrders}>
                    🔄 Refresh
                </button>
            </div>

            <div className="alert alert-info mb-4">
                <strong>Pending Orders:</strong> {pendingOrders.length}
            </div>

            {pendingOrders.length === 0 ? (
                <div className="alert alert-success">
                    <h4>✅ All Caught Up!</h4>
                    <p>No pending orders to review.</p>
                </div>
            ) : (
                <div className="row">
                    {pendingOrders.map(order => (
                        <div key={order.orderId} className="col-12 mb-4">
                            <div className="card border-warning">
                                <div className="card-header bg-warning text-dark">
                                    <strong>⏳ Pending Order:</strong> {order.orderId}
                                    <br />
                                    <small>Submitted: {new Date(order.timestamp).toLocaleString()}</small>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {/* Customer Info */}
                                        <div className="col-md-4">
                                            <h6>Customer:</h6>
                                            <p>
                                                <strong>{order.shipping.firstName} {order.shipping.lastName}</strong><br />
                                                📧 {order.shipping.email}<br />
                                                📱 {order.shipping.phone}
                                            </p>
                                            
                                            <h6>Shipping Address:</h6>
                                            <p>
                                                {order.shipping.address.line1}<br />
                                                {order.shipping.address.line2 && <>{order.shipping.address.line2}<br /></>}
                                                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}
                                            </p>

                                            <h6>Payment:</h6>
                                            <p>{order.payment.method}</p>
                                        </div>

                                        {/* Order Details */}
                                        <div className="col-md-5">
                                            <h6>Order Items:</h6>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Qty</th>
                                                        <th>Price</th>
                                                        <th>Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.title}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>${item.price.toFixed(2)}</td>
                                                            <td>${item.subtotal.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colSpan="3">Total:</th>
                                                        <th>${order.total.toFixed(2)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>

                                            {order.specialInstructions && (
                                                <>
                                                    <h6>Special Instructions:</h6>
                                                    <p className="text-muted">{order.specialInstructions}</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-md-3">
                                            <h6>Actions:</h6>
                                            <div className="d-grid gap-2">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleApprove(order.orderId)}
                                                >
                                                    ✅ Approve Order
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDecline(order.orderId)}
                                                >
                                                    ❌ Decline Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderApprovalPage;