import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEYS, getFromStorage, saveToStorage } from '../utils/localStorage';

function SignUpPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: ''
    });

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
            alert('⚠️ Please fill in all fields!');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('⚠️ Please enter a valid email address!');
            return;
        }

        // Password validation
        if (formData.password.length < 6) {
            alert('⚠️ Password must be at least 6 characters long!');
            return;
        }

        // Get existing users
        const users = getFromStorage(KEYS.USERS) || [];

        // Check if username exists
        if (users.find(u => u.username === formData.username)) {
            alert('⚠️ Username already exists!');
            return;
        }

        // Add new user
        const newUser = {
            ...formData,
            dateRegistered: new Date().toISOString()
        };

        users.push(newUser);
        saveToStorage(KEYS.USERS, users);

        console.log('✅ User registered:', newUser);
        alert('✅ Registration successful!\n\nWelcome, ' + formData.firstName + '!');

        // Navigate to products page
        setTimeout(() => {
            navigate('/products');
        }, 1000);
    }

    return (
        <>
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Create Account</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
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

                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
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

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
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

                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="username" 
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100">
                                        Sign Up
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

export default SignUpPage;