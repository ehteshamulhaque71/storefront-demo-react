import React, { useState, useEffect } from 'react';

function OrderHistoryPage() {
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

    function getStatusBadge(status) {
        if (status === 'pending') {
            return <span className="badge bg-warning text-dark">⏳ Pending</span>;
        } else if (status === 'approved') {
            return <span className="badge bg-success">✅ Approved</span>;
        } else if (status === 'declined') {
            return <span className="badge bg-danger">❌ Declined</span>;
        }
        return <span className="badge bg-secondary">Unknown</span>;
    }

    function formatDate(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading your orders...</p>
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
                    <h2>My Order History</h2>
                    <button className="btn btn-outline-primary" onClick={loadOrders}>
                        🔄 Refresh
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        <h4 className="alert-heading">No Orders Yet</h4>
                        <p>You haven't placed any orders yet.</p>
                        <hr />
                        <p className="mb-0">
                            Start shopping and place your first order!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="alert alert-info mb-4">
                            <strong>{orders.length}</strong> order(s) found
                        </div>

                        {orders.map(order => (
                            <div key={order.orderId} className="card mb-3">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Order #{order.orderId}</h5>
                                        <small className="text-muted">
                                            Placed on {formatDate(order.timestamp)}
                                        </small>
                                    </div>
                                    <div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        {/* Order Details */}
                                        <div className="col-md-6">
                                            <h6>Order Details:</h6>
                                            <p className="mb-1">
                                                <strong>Total:</strong> ${order.total.toFixed(2)}
                                            </p>
                                            <p className="mb-1">
                                                <strong>Items:</strong> {order.items.length} item(s)
                                            </p>
                                            <p className="mb-1">
                                                <strong>Payment:</strong> {order.payment.method}
                                            </p>

                                            {/* Items List */}
                                            <h6 className="mt-3">Items:</h6>
                                            <ul className="list-unstyled">
                                                {order.items.map((item, index) => (
                                                    <li key={index} className="mb-1">
                                                        <small>
                                                            {item.title} × {item.quantity} - ${item.subtotal.toFixed(2)}
                                                        </small>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Shipping Info */}
                                        <div className="col-md-6">
                                            <h6>Shipping Address:</h6>
                                            <p className="mb-1">
                                                {order.shipping.firstName} {order.shipping.lastName}
                                            </p>
                                            <p className="mb-1">
                                                {order.shipping.email}
                                            </p>
                                            <p className="mb-1">
                                                {order.shipping.phone}
                                            </p>
                                            <p className="mb-1">
                                                {order.shipping.address.line1}
                                            </p>
                                            {order.shipping.address.line2 && (
                                                <p className="mb-1">
                                                    {order.shipping.address.line2}
                                                </p>
                                            )}
                                            <p className="mb-1">
                                                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}
                                            </p>

                                            {order.specialInstructions && (
                                                <>
                                                    <h6 className="mt-3">Special Instructions:</h6>
                                                    <p className="text-muted small">
                                                        {order.specialInstructions}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Approval/Decline Timestamp */}
                                    {order.approvedAt && (
                                        <div className="alert alert-success mt-3 mb-0">
                                            <small>
                                                ✅ Approved on {formatDate(order.approvedAt)}
                                            </small>
                                        </div>
                                    )}
                                    {order.declinedAt && (
                                        <div className="alert alert-danger mt-3 mb-0">
                                            <small>
                                                ❌ Declined on {formatDate(order.declinedAt)}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2026 StoreFront | IST 256 Group Project</p>
            </footer>
        </>
    );
}

export default OrderHistoryPage;