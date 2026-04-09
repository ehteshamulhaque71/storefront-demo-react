import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEYS, getFromStorage, removeFromStorage } from '../utils/localStorage';

function FinalizationPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Load cart on mount
    useEffect(() => {
        const storedCart = getFromStorage(KEYS.CART) || [];
        
        if (storedCart.length === 0) {
            alert('⚠️ Your cart is empty! Please add items before checkout.');
            navigate('/cart');
            return;
        }
        
        setCart(storedCart);
        console.log('✅ Cart loaded for checkout:', storedCart.length, 'items');
    }, [navigate]);

    // Handle form input changes
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    // Calculate total
    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Validate form
    function validateForm() {
        // Check required fields
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.phone || !formData.address1 || !formData.city || 
            !formData.state || !formData.zip) {
            alert('⚠️ Please fill in all required fields!');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('⚠️ Please enter a valid email address.');
            return false;
        }

        // Phone validation
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (!phoneRegex.test(formData.phone)) {
            alert('⚠️ Please enter a valid phone number (e.g., 555-123-4567).');
            return false;
        }

        // ZIP validation
        const zipRegex = /^[0-9]{5}$/;
        if (!zipRegex.test(formData.zip)) {
            alert('⚠️ Please enter a valid 5-digit ZIP code.');
            return false;
        }

        return true;
    }

    // Create order JSON
    function createOrderJSON() {
        const order = {
            orderId: 'ORD-' + Date.now(),
            timestamp: new Date().toISOString(),
            items: cart.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
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

        return order;
    }

    // Submit order
async function submitOrder(orderData) {
    console.log('📡 Submitting order via AJAX...');
    console.log('Order data:', orderData);

    setIsSubmitting(true);

    try {
        // CHANGED: Use your Node.js server instead of JSONPlaceholder
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

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
        alert('❌ Order submission failed. Please try again.\n\nError: ' + error.message);
        setIsSubmitting(false);
    }
}

    // Handle form submit
    function handleSubmit(e) {
        e.preventDefault();

        console.log('📝 Form submitted');

        // Validate form
        if (!validateForm()) {
            console.log('❌ Validation failed');
            return;
        }

        console.log('✅ Validation passed');

        // Create order JSON
        const orderData = createOrderJSON();
        console.log('📦 Order JSON created:', orderData);

        // Confirm before submitting
        const confirmMessage = `Please confirm your order:

Items: ${cart.length}
Total: $${calculateTotal().toFixed(2)}

Ship to:
${formData.firstName} ${formData.lastName}
${formData.address1}
${formData.city}, ${formData.state} ${formData.zip}

Payment: ${formData.paymentMethod}`;

        if (window.confirm(confirmMessage)) {
            submitOrder(orderData);
        } else {
            console.log('⚠️ Order cancelled by user');
        }
    }

    return (
        <>
            <div className="container my-5">
                <h2 className="mb-4">Order Finalization</h2>

                <div className="row">
                    {/* Left Column: Order Summary */}
                    <div className="col-md-5">
                        <div className="card mb-4">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {cart.map((item, index) => {
                                        const itemTotal = item.price * item.quantity;
                                        return (
                                            <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                                <div>
                                                    <h6 className="mb-1">{item.title}</h6>
                                                    <small className="text-muted">
                                                        {item.quantity} × ${item.price.toFixed(2)}
                                                    </small>
                                                </div>
                                                <strong>${itemTotal.toFixed(2)}</strong>
                                            </div>
                                        );
                                    })}
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Total:</h5>
                                    <h5 className="mb-0 text-success" id="orderTotal">
                                        ${calculateTotal().toFixed(2)}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Shipping Form */}
                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Shipping & Payment Information</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Name */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="firstName" className="form-label">First Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="firstName" 
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="lastName" className="form-label">Last Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="lastName" 
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label">Email *</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label">Phone *</label>
                                            <input 
                                                type="tel" 
                                                className="form-control" 
                                                id="phone" 
                                                name="phone"
                                                placeholder="555-123-4567"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="mb-3">
                                        <label htmlFor="address1" className="form-label">Address Line 1 *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="address1" 
                                            name="address1"
                                            placeholder="Street address"
                                            value={formData.address1}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="address2" className="form-label">Address Line 2</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="address2" 
                                            name="address2"
                                            placeholder="Apt, suite, unit, etc. (optional)"
                                            value={formData.address2}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* City, State, ZIP */}
                                    <div className="row">
                                        <div className="col-md-5 mb-3">
                                            <label htmlFor="city" className="form-label">City *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="city" 
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="state" className="form-label">State *</label>
                                            <select 
                                                className="form-select" 
                                                id="state" 
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choose...</option>
                                                <option value="PA">Pennsylvania</option>
                                                <option value="NY">New York</option>
                                                <option value="NJ">New Jersey</option>
                                                <option value="CA">California</option>
                                                <option value="TX">Texas</option>
                                                <option value="FL">Florida</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label htmlFor="zip" className="form-label">ZIP *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="zip" 
                                                name="zip"
                                                placeholder="12345"
                                                maxLength="5"
                                                value={formData.zip}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mb-3">
                                        <label className="form-label">Payment Method *</label>
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    id="creditCard" 
                                                    value="creditCard"
                                                    checked={formData.paymentMethod === 'creditCard'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="creditCard">
                                                    Credit Card
                                                </label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    id="debitCard" 
                                                    value="debitCard"
                                                    checked={formData.paymentMethod === 'debitCard'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="debitCard">
                                                    Debit Card
                                                </label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="paymentMethod" 
                                                    id="paypal" 
                                                    value="paypal"
                                                    checked={formData.paymentMethod === 'paypal'}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label" htmlFor="paypal">
                                                    PayPal
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div className="mb-3">
                                        <label htmlFor="specialInstructions" className="form-label">Special Instructions</label>
                                        <textarea 
                                            className="form-control" 
                                            id="specialInstructions" 
                                            name="specialInstructions"
                                            rows="3"
                                            placeholder="Any special delivery instructions..."
                                            value={formData.specialInstructions}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        className="btn btn-success w-100 btn-lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>Place Order - ${calculateTotal().toFixed(2)}</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2026 StoreFront | IST 256 Group Project</p>
            </footer>
        </>
    );
}

export default FinalizationPage;