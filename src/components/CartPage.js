import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEYS, getFromStorage, saveToStorage } from '../utils/localStorage';

function CartPage({ updateCart }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Load products and cart on mount
    useEffect(() => {
        const storedProducts = getFromStorage(KEYS.PRODUCTS) || [];
        const storedCart = getFromStorage(KEYS.CART) || [];
        setProducts(storedProducts);
        setCart(storedCart);
        console.log('✅ Cart loaded:', storedCart.length, 'items');
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(KEYS.CART, cart);
        updateCart(cart); // Update parent App component
    }, [cart]);

    // Get product by ID
    function getProduct(productId) {
        return products.find(p => p.id === productId);
    }

    // Get available inventory for product
    function getAvailableInventory(productId) {
        const product = getProduct(productId);
        if (!product) return 0;
        return product.inventory !== undefined ? product.inventory : null;
    }

    // Check if quantity is available
    function isQuantityAvailable(productId, requestedQuantity) {
        const availableInventory = getAvailableInventory(productId);
        if (availableInventory === null) return true; // No limit
        return requestedQuantity <= availableInventory;
    }

    // Add to cart
    function addToCart(productId) {
        const product = getProduct(productId);
        
        if (!product) {
            alert('❌ Product not found');
            return;
        }

        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + 1;
            
            if (!isQuantityAvailable(productId, newQuantity)) {
                const available = getAvailableInventory(productId);
                alert(`⚠️ Cannot add more. Only ${available} units of "${product.title}" available in stock!`);
                return;
            }
            
            setCart(cart.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            if (!isQuantityAvailable(productId, 1)) {
                alert(`⚠️ "${product.title}" is out of stock!`);
                return;
            }
            
            setCart([...cart, {
                id: product.id,
                title: product.title,
                price: product.price,
                category: product.category,
                quantity: 1
            }]);
        }

        console.log('✅ Added to cart:', product.title);
    }

    // Remove from cart
    function removeFromCart(index) {
        const item = cart[index];
        
        if (!confirm(`Remove ${item.title} from cart?`)) {
            return;
        }
        
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        
        console.log('🗑️ Removed from cart:', item.title);
    }

    // Update quantity (+ or -)
    function updateQuantity(index, change) {
        const item = cart[index];
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(index);
            return;
        }
        
        if (!isQuantityAvailable(item.id, newQuantity)) {
            const available = getAvailableInventory(item.id);
            alert(`⚠️ Cannot increase quantity. Only ${available} units of "${item.title}" available in stock!`);
            return;
        }
        
        setCart(cart.map((cartItem, i) => 
            i === index 
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
        ));
    }

    // Set quantity directly (from input)
    function setQuantity(index, quantity) {
        const item = cart[index];
        const newQuantity = parseInt(quantity);
        
        if (isNaN(newQuantity) || newQuantity < 1) {
            alert('⚠️ Please enter a valid quantity (minimum 1)');
            return;
        }
        
        if (!isQuantityAvailable(item.id, newQuantity)) {
            const available = getAvailableInventory(item.id);
            alert(`⚠️ Only ${available} units of "${item.title}" available in stock! Cannot set quantity to ${newQuantity}.`);
            return;
        }
        
        setCart(cart.map((cartItem, i) => 
            i === index 
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
        ));
    }

    // Validate cart before checkout
    function validateCart() {
        const issues = [];
        
        cart.forEach((item) => {
            const availableInventory = getAvailableInventory(item.id);
            
            if (availableInventory !== null && item.quantity > availableInventory) {
                issues.push(`${item.title}: You have ${item.quantity} in cart, but only ${availableInventory} available in stock`);
            }
        });
        
        if (issues.length > 0) {
            alert('⚠️ Cannot proceed with checkout. The following items exceed available inventory:\n\n' + 
                  issues.join('\n') + 
                  '\n\nPlease adjust quantities before checking out.');
            return false;
        }
        
        return true;
    }

    // Checkout
    function handleCheckout() {
        if (cart.length === 0) {
            alert('⚠️ Your cart is empty!');
            return;
        }

        if (!validateCart()) {
            return;
        }

        console.log('✅ Cart validated, proceeding to checkout');
        navigate('/checkout');
    }

    // Calculate total
    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Filter products for search
    const filteredProducts = searchTerm === ''
        ? products
        : products.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <>
            <div className="container my-5">
                <h2 className="mb-4">Shopping Cart</h2>

                <div className="row">
                    {/* Left Column: Browse Products */}
                    <div className="col-md-6">
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Browse Products</h5>
                            </div>
                            <div className="card-body">
                                {/* Search Box */}
                                <div className="mb-3">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Product List */}
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-muted">No products available</p>
                                    ) : (
                                        filteredProducts.map(product => {
                                            const inventoryText = product.inventory !== undefined 
                                                ? `(${product.inventory} in stock)` 
                                                : '';
                                            
                                            return (
                                                <div key={product.id} className="card mb-2 product-card">
                                                    <div className="card-body py-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>{product.title}</h6>
                                                                <small className="text-muted">
                                                                    {product.category} | {product.unitMeasure} {inventoryText}
                                                                </small>
                                                            </div>
                                                            <div className="text-end">
                                                                <div className="text-success mb-1" style={{ fontSize: '0.9rem' }}>
                                                                    <strong>${product.price.toFixed(2)}</strong>
                                                                </div>
                                                                <button 
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => addToCart(product.id)}
                                                                >
                                                                    Add to Cart
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cart */}
                    <div className="col-md-6">
                        <div className="card mb-4">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h5>
                            </div>
                            <div className="card-body">
                                {cart.length === 0 ? (
                                    <p className="text-muted">Your cart is empty</p>
                                ) : (
                                    <>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {cart.map((item, index) => {
                                                const itemTotal = item.price * item.quantity;
                                                const availableInventory = getAvailableInventory(item.id);
                                                const inventoryNote = availableInventory !== null 
                                                    ? `(${availableInventory} available)` 
                                                    : '';
                                                
                                                return (
                                                    <div key={index} className="cart-item mb-3 pb-3 border-bottom">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1">{item.title}</h6>
                                                                <small className="text-muted">${item.price.toFixed(2)} each</small>
                                                            </div>
                                                            <button 
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => removeFromCart(index)}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="btn-group btn-group-sm" role="group">
                                                                    <button 
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() => updateQuantity(index, -1)}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input 
                                                                        type="text" 
                                                                        className="form-control form-control-sm quantity-input" 
                                                                        style={{ width: '60px', textAlign: 'center' }} 
                                                                        value={item.quantity}
                                                                        onChange={(e) => setQuantity(index, e.target.value)}
                                                                        onKeyPress={(e) => {
                                                                            // Only allow numbers
                                                                            if (e.which < 48 || e.which > 57) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button 
                                                                        className="btn btn-outline-secondary"
                                                                        onClick={() => updateQuantity(index, 1)}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                {inventoryNote && (
                                                                    <small className="text-muted">{inventoryNote}</small>
                                                                )}
                                                            </div>
                                                            <strong className="item-subtotal">${itemTotal.toFixed(2)}</strong>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <hr />

                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Total:</h5>
                                            <h5 className="mb-0 text-success">${calculateTotal().toFixed(2)}</h5>
                                        </div>

                                        <button 
                                            className="btn btn-success w-100 btn-lg"
                                            onClick={handleCheckout}
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </>
                                )}
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

export default CartPage;