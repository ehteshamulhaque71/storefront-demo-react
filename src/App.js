import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import SignUpPage from './components/SignUpPage';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import FinalizationPage from './components/FinalizationPage';
import OrderHistoryPage from './components/OrderHistoryPage';  // NEW
import OrderApprovalPage from './components/OrderApprovalPage'; // NEW
import { KEYS, getFromStorage } from './utils/localStorage';
import './App.css';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState([]);

    // Load cart from localStorage
    useEffect(() => {
        const storedCart = getFromStorage(KEYS.CART) || [];
        setCart(storedCart);
    }, []);

    // Calculate total cart items
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Determine current page from URL
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path === '/signup') return 'signup';
        if (path === '/products') return 'products';
        if (path === '/cart') return 'cart';
        if (path === '/checkout') return 'finalization';
        if (path === '/order-history') return 'order-history';  // NEW
        if (path === '/admin') return 'admin';  // NEW
        return 'home';
    };

    function handleNavigate(page) {
        const routes = {
            home: '/',
            signup: '/signup',
            products: '/products',
            cart: '/cart',
            finalization: '/checkout',
            'order-history': '/order-history',  // NEW
            admin: '/admin'  // NEW
        };
        navigate(routes[page] || '/');
    }

    // Function to update cart (passed to CartPage)
    function updateCart(newCart) {
        setCart(newCart);
    }

    return (
        <div className="App">
            <Navbar 
                currentPage={getCurrentPage()}
                onNavigate={handleNavigate}
                cartCount={cartCount}
            />

            <Routes>
                <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
                <Route path="/signup" element={<SignUpPage onNavigate={handleNavigate} />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/cart" element={<CartPage updateCart={updateCart} onNavigate={handleNavigate} />} />
                <Route path="/checkout" element={<FinalizationPage onNavigate={handleNavigate} />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />  {/* NEW */}
                <Route path="/admin" element={<OrderApprovalPage />} />  {/* NEW */}
            </Routes>
        </div>
    );
}

export default App;