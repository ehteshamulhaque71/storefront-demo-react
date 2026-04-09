import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage, removeFromStorage, KEYS } from '../utils/localStorage';

function FinalizationPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        paymentMethod: 'creditCard',
        specialInstructions: ''
    });

    useEffect(() => {
        loadCart();
    }, []);

    function loadCart() {
        const cartData = getFromStorage(KEYS.CART) || [];
        setCart(cartData);

        if (cartData.length === 0) {
            alert('Your cart is empty! Redirecting to products page...');
            navigate('/products');
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function calculateTotal() {
        return cart.reduce((sum, item) => {
            // Handle cases where subtotal might not exist
            const subtotal = item.subtotal || (item.price * item.quantity);
            return sum + subtotal;
        }, 0);
    }

    function validateForm() {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'zip'];
        
        for (let field of required) {
            if (!formData[field].trim()) {
                alert(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Phone validation (simple)
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert('Please enter phone in format: 555-123-4567');
            return false;
        }

        // ZIP validation
        const zipRegex = /^\d{5}$/;
        if (!zipRegex.test(formData.zip)) {
            alert('Please enter a valid 5-digit ZIP code');
            return false;
        }

        return true;
    }

    async function submitOrder(orderData) {
        console.log('📡 Submitting order via AJAX...');
        console.log('Order data:', orderData);

        setIsSubmitting(true);

        try {
            // Determine API URL based on environment
            // If running on port 1234 (dev), use localhost:3000
            // If running on port 3000 (prod), use relative URL
            const API_URL = window.location.port === '1234' 
                ? 'http://localhost:3000' 
                : '';
            
            console.log('API URL:', API_URL + '/api/orders');
            
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Server response:', data);

            // Success - clear cart and show confirmation
            removeFromStorage(KEYS.CART);

            const message = `✅ Order Placed Successfully!

Order ID: ${data.orderId}
Total: $${orderData.total.toFixed(2)}
Email confirmation sent to: ${orderData.shipping.email}

Your order is pending approval.
You can view your order status in Order History.`;

            alert(message);

            // Redirect to order history page
            setTimeout(() => {
                navigate('/order-history');
            }, 2000);

        } catch (error) {
            console.error('❌ AJAX Error:', error);
            alert(`❌ Order submission failed. Please try again.

Error: ${error.message}`);
            setIsSubmitting(false);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare order data with calculated subtotals
        const orderData = {
            items: cart.map(item => ({
                ...item,
                subtotal: item.subtotal || (item.price * item.quantity)
            })),
            total: calculateTotal(),
            shipping: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: {
                    line1: formData.address1,
                    line2: formData.address2,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip
                }
            },
            payment: {
                method: formData.paymentMethod
            },
            specialInstructions: formData.specialInstructions
        };

        // Submit order
        submitOrder(orderData);
    }

    return (
        <div className="container my-5">
            <h1 className="mb-4">Checkout</h1>

            <div className="row">
                {/* Order Summary */}
                <div className="col-md-4 mb-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Order Summary</h5>
                        </div>
                        <div className="card-body">
                            {cart.map(item => {
                                // Calculate subtotal if it doesn't exist
                                const subtotal = item.subtotal || (item.price * item.quantity);
                                
                                return (
                                    <div key={item.id} className="mb-2">
                                        <strong>{item.title}</strong>
                                        <br />
                                        <small>
                                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                                            <br />
                                            Subtotal: ${subtotal.toFixed(2)}
                                        </small>
                                    </div>
                                );
                            })}
                            <hr />
                            <h5>Total: ${calculateTotal().toFixed(2)}</h5>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="col-md-8">
                    <form onSubmit={handleSubmit}>
                        {/* Shipping Information */}
                        <div className="card mb-4">
                            <div className="card-header bg-secondary text-white">
                                <h5 className="mb-0">Shipping Information</h5>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">First Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Last Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Phone * (555-123-4567)</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="555-123-4567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address1"
                                        value={formData.address1}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address Line 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address2"
                                        value={formData.address2}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">City *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">State *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            maxLength="2"
                                            placeholder="PA"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">ZIP *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                            maxLength="5"
                                            placeholder="16801"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="card mb-4">
                            <div className="card-header bg-secondary text-white">
                                <h5 className="mb-0">Payment Information</h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Payment Method *</label>
                                    <select
                                        className="form-select"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="creditCard">Credit Card</option>
                                        <option value="debitCard">Debit Card</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="cashOnDelivery">Cash on Delivery</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="card mb-4">
                            <div className="card-header bg-secondary text-white">
                                <h5 className="mb-0">Special Instructions</h5>
                            </div>
                            <div className="card-body">
                                <textarea
                                    className="form-control"
                                    name="specialInstructions"
                                    value={formData.specialInstructions}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Any special delivery instructions..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid gap-2">
                            <button
                                type="submit"
                                className="btn btn-success btn-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/cart')}
                                disabled={isSubmitting}
                            >
                                Back to Cart
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FinalizationPage;