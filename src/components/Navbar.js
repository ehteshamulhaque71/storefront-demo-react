import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ currentPage, cartCount }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    StoreFront
                </Link>

                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/signup" className={`nav-link ${currentPage === 'signup' ? 'active' : ''}`}>
                                SignUp
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/products" className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}>
                                Products
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/cart" className={`nav-link ${currentPage === 'cart' ? 'active' : ''}`}>
                                Cart
                                {cartCount > 0 && (
                                    <span className="badge bg-danger ms-2">{cartCount}</span>
                                )}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/checkout" className={`nav-link ${currentPage === 'finalization' ? 'active' : ''}`}>
                                Checkout
                            </Link>
                        </li>
                        {/* NEW - L10 Links */}
                        <li className="nav-item">
                            <Link to="/order-history" className={`nav-link ${currentPage === 'order-history' ? 'active' : ''}`}>
                                My Orders
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin" className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}>
                                Admin
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;