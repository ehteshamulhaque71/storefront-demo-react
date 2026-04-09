import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <>
            <div className="container my-5">
                <div className="jumbotron text-center">
                    <h1 className="display-4">Welcome to StoreFront</h1>
                    <p className="lead">Your one-stop shop for everything you need</p>
                    <hr className="my-4" />
                    <p>Browse our products and start shopping today!</p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        Shop Now
                    </Link>
                </div>

                <div className="row mt-5">
                    <div className="col-md-4 mb-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">📦 Quality Products</h5>
                                <p className="card-text">Top-quality items at great prices</p>
                                <Link to="/products" className="btn btn-outline-primary">
                                    Browse Products
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">🚚 Fast Shipping</h5>
                                <p className="card-text">Get your orders delivered quickly</p>
                                <Link to="/cart" className="btn btn-outline-primary">
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card text-center">
                            <div className="card-body">
                                <h5 className="card-title">💯 Satisfaction</h5>
                                <p className="card-text">100% satisfaction guaranteed</p>
                                <Link to="/signup" className="btn btn-outline-primary">
                                    Sign Up
                                </Link>
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

export default HomePage;