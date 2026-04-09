import React, { useState, useEffect } from 'react';
import { KEYS, getFromStorage, saveToStorage } from '../utils/localStorage';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        productTitle: '',
        category: '',
        unitMeasure: '',
        price: '',
        inventory: '',
        additionalInfo: ''
    });

    // Load products on mount
    useEffect(() => {
        const storedProducts = getFromStorage(KEYS.PRODUCTS) || [];
        setProducts(storedProducts);
        console.log('✅ Products loaded:', storedProducts.length);
    }, []);

    function handleFormChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function handleAddProduct(e) {
        e.preventDefault();

        // Validation
        if (!formData.productTitle || !formData.category || !formData.unitMeasure || !formData.price) {
            alert('⚠️ Please fill in all required fields!');
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            alert('⚠️ Price must be greater than 0!');
            return;
        }

        // Create new product
        const newProduct = {
            id: 'PROD-' + Date.now(),
            title: formData.productTitle,
            category: formData.category,
            unitMeasure: formData.unitMeasure,
            price: parseFloat(formData.price),
            inventory: formData.inventory ? parseInt(formData.inventory) : undefined,
            additionalInfo: formData.additionalInfo || 'N/A',
            dateAdded: new Date().toISOString()
        };

        // Update products
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        saveToStorage(KEYS.PRODUCTS, updatedProducts);

        console.log('✅ Product added:', newProduct);
        alert('✅ Product added successfully!');

        // Reset form
        setFormData({
            productTitle: '',
            category: '',
            unitMeasure: '',
            price: '',
            inventory: '',
            additionalInfo: ''
        });
    }

    // Filter products
    const filteredProducts = searchTerm === ''
        ? products
        : products.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <>
            <div className="container my-5">
                <h2 className="mb-4">Product Catalog</h2>

                {/* Add Product Form */}
                <div className="card mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Add New Product</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleAddProduct}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="productTitle" className="form-label">Product Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="productTitle" 
                                        name="productTitle"
                                        value={formData.productTitle}
                                        onChange={handleFormChange}
                                        required 
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select 
                                        className="form-select" 
                                        id="category" 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">Choose...</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Books">Books</option>
                                        <option value="Home">Home</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="price" className="form-label">Price</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        id="price" 
                                        name="price"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="unitMeasure" className="form-label">Unit Measure</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="unitMeasure" 
                                        name="unitMeasure"
                                        placeholder="e.g., 1 piece, 1 lb"
                                        value={formData.unitMeasure}
                                        onChange={handleFormChange}
                                        required 
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="inventory" className="form-label">Inventory</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        id="inventory" 
                                        name="inventory"
                                        min="0"
                                        placeholder="Leave empty for unlimited"
                                        value={formData.inventory}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="additionalInfo" className="form-label">Additional Info</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="additionalInfo" 
                                        name="additionalInfo"
                                        placeholder="Optional"
                                        value={formData.additionalInfo}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-success">Add Product</button>
                        </form>
                    </div>
                </div>

                {/* Search Box */}
                <div className="card p-3 mb-4">
                    <label htmlFor="searchBox" className="form-label"><strong>Search Products:</strong></label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="searchBox"
                        placeholder="Search by title or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Product List */}
                <div>
                    {filteredProducts.length === 0 ? (
                        <p className="text-muted">No products yet. Add a product to get started!</p>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} className="card mb-3 product-card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h6 className="mb-1">{product.title}</h6>
                                            <small className="text-muted">
                                                {product.category} | {product.unitMeasure}
                                            </small>
                                            {product.inventory !== undefined && (
                                                <><br /><small className="text-muted">({product.inventory} in stock)</small></>
                                            )}
                                            {product.additionalInfo !== 'N/A' && (
                                                <><br /><small className="text-muted">{product.additionalInfo}</small></>
                                            )}
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <h6 className="text-success mb-0">${product.price.toFixed(2)}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2026 StoreFront | IST 256 Group Project</p>
            </footer>
        </>
    );
}

export default ProductsPage;