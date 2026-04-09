import React, { useState, useEffect } from 'react';

function OrderHistoryPage() {
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

    function getStatusBadge(status) {
        const badges = {
            pending: 'bg-warning text-dark',
            approved: 'bg-success',
            declined: 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    }

    function getStatusIcon(status) {
        const icons = {
            pending: '⏳',
            approved: '✅',
            declined: '❌'
        };
        return icons[status] || '📦';
    }

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
                <h1>My Orders</h1>
                <button className="btn btn-primary" onClick={loadOrders}>
                    🔄 Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="alert alert-info">
                    <h4>No Orders Yet</h4>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <a href="/products" className="btn btn-primary">Browse Products</a>
                </div>
            ) : (
                <div className="row">
                    {orders.map(order => (
                        <div key={order.orderId} className="col-12 mb-4">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Order ID:</strong> {order.orderId}
                                        <br />
                                        <small className="text-muted">
                                            Placed: {new Date(order.timestamp).toLocaleString()}
                                        </small>
                                    </div>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>
                                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {/* Order Items */}
                                        <div className="col-md-6">
                                            <h6>Items:</h6>
                                            <ul className="list-unstyled">
                                                {order.items.map((item, index) => (
                                                    <li key={index} className="mb-2">
                                                        <strong>{item.title}</strong>
                                                        <br />
                                                        <small>
                                                            Qty: {item.quantity} × ${item.price.toFixed(2)} = ${item.subtotal.toFixed(2)}
                                                        </small>
                                                    </li>
                                                ))}
                                            </ul>
                                            <hr />
                                            <strong>Total: ${order.total.toFixed(2)}</strong>
                                        </div>

                                        {/* Shipping Info */}
                                        <div className="col-md-6">
                                            <h6>Shipping Information:</h6>
                                            <p className="mb-1">
                                                <strong>{order.shipping.firstName} {order.shipping.lastName}</strong><br />
                                                {order.shipping.email}<br />
                                                {order.shipping.phone}<br />
                                                {order.shipping.address.line1}<br />
                                                {order.shipping.address.line2 && <>{order.shipping.address.line2}<br /></>}
                                                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}
                                            </p>
                                            
                                            <h6 className="mt-3">Payment Method:</h6>
                                            <p>{order.payment.method}</p>

                                            {order.specialInstructions && (
                                                <>
                                                    <h6 className="mt-3">Special Instructions:</h6>
                                                    <p className="text-muted">{order.specialInstructions}</p>
                                                </>
                                            )}

                                            {order.approvedAt && (
                                                <p className="text-success mt-3">
                                                    <small>✅ Approved: {new Date(order.approvedAt).toLocaleString()}</small>
                                                </p>
                                            )}

                                            {order.declinedAt && (
                                                <p className="text-danger mt-3">
                                                    <small>❌ Declined: {new Date(order.declinedAt).toLocaleString()}</small>
                                                </p>
                                            )}
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

export default OrderHistoryPage;