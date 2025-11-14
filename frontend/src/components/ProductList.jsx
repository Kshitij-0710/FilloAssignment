// frontend/src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import api from '../api.jsx';

// --- Default state for a blank product ---
const BLANK_PRODUCT_FORM = {
  id: null,
  sku: '',
  name: '',
  description: '',
  active: true,
};

function ProductList({ refreshKey }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State for the dialog (Create/Edit) ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(BLANK_PRODUCT_FORM);
  const [formError, setFormError] = useState(null);

  // --- State for Detail Modal ---
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- State for Warning Modals ---
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDeleteAllWarning, setShowDeleteAllWarning] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // --- State for Pagination and Search ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeSearch, setActiveSearch] = useState('');
  
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    next: null,
    previous: null,
    totalPages: 0,
  });

  // --- Data Fetching ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/', {
        params: { page: currentPage, search: activeSearch }
      });
      const { data } = response;
      setProducts(data.results);
      setPageInfo({
        count: data.count,
        next: data.next,
        previous: data.previous,
        totalPages: Math.ceil(data.count / 25) || 1
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
    setLoading(false);
  };

  // Re-fetch when refreshKey, page, or search changes
  useEffect(() => {
    fetchProducts();
  }, [refreshKey, currentPage, activeSearch]); 

  // --- Form & CRUD Handlers ---

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (isEditing) {
        // Use PATCH for edit
        await api.patch(`/products/${form.id}/`, form);
      } else {
        // Use POST for create
        await api.post('/products/', form);
      }
      resetFormAndRefresh();
    } catch (err) {
      // Handle "SKU already exists" error
      const errorMsg = err.response?.data?.sku?.[0] || 'An error occurred.';
      setFormError(errorMsg);
    }
  };

  const resetFormAndRefresh = () => {
    setForm(BLANK_PRODUCT_FORM);
    setIsEditing(false);
    setIsDialogOpen(false);
    setFormError(null);
    fetchProducts(); // Refresh the list
  };

  // Called when "Create" button is clicked
  const handleCreateClick = () => {
    setForm(BLANK_PRODUCT_FORM);
    setIsEditing(false);
    setFormError(null);
    setIsDialogOpen(true);
  };
  
  // Called when "Edit" on a card is clicked
  const handleEditClick = (product) => {
    setForm(product);
    setIsEditing(true);
    setFormError(null);
    setIsDialogOpen(true);
  };
  
  // Called when "View Details" is clicked
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };
  
  // Called when "Delete" on a card is clicked
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setShowDeleteWarning(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete}/`);
      setShowDeleteWarning(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // --- Search & Pagination Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    setActiveSearch(searchTerm);
  };
  const handleNext = () => (pageInfo.next) && setCurrentPage(p => p + 1);
  const handlePrevious = () => (pageInfo.previous) && setCurrentPage(p => p - 1);

  // --- Bulk Delete (Story 3) ---
  const handleBulkDelete = () => {
    setShowDeleteAllWarning(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await api.post('/products/bulk_delete/');
      setShowDeleteAllWarning(false);
      setCurrentPage(1);
      setActiveSearch('');
      setSearchTerm('');
      fetchProducts(); 
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    }
  };

  // --- RENDER ---
  return (
    <div>
      {/* --- Delete Warning Modal --- */}
      {showDeleteWarning && (
        <div className="dialog-overlay" onClick={() => setShowDeleteWarning(false)}>
          <div className="warning-modal" onClick={(e) => e.stopPropagation()}>
            <div className="warning-header">
              <div className="warning-icon">⚠️</div>
              <h2>Delete Product?</h2>
            </div>
            <div className="warning-content">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            </div>
            <div className="warning-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteWarning(false)}>Cancel</button>
              <button className="danger-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete All Warning Modal --- */}
      {showDeleteAllWarning && (
        <div className="dialog-overlay" onClick={() => setShowDeleteAllWarning(false)}>
          <div className="warning-modal danger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="warning-header danger">
              <div className="warning-icon-large">🚨</div>
              <h2>⚠️ DANGER ZONE ⚠️</h2>
            </div>
            <div className="warning-content">
              <div className="danger-box">
                <p className="danger-title">YOU ARE ABOUT TO DELETE ALL PRODUCTS!</p>
                <p className="danger-message">This action will permanently delete <strong>ALL {pageInfo.count} products</strong> from your database.</p>
                <p className="danger-warning">⛔ This action is IRREVERSIBLE and CANNOT be undone!</p>
                <p className="danger-confirm">Are you absolutely sure you want to continue?</p>
              </div>
            </div>
            <div className="warning-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteAllWarning(false)}>Cancel</button>
              <button className="danger-btn critical" onClick={confirmBulkDelete}>Yes, Delete Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Detail Modal --- */}
      {isDetailOpen && selectedProduct && (
        <div className="dialog-overlay" onClick={() => setIsDetailOpen(false)}>
          <div className="dialog-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Product Details</h2>
              <button className="dialog-close" onClick={() => setIsDetailOpen(false)}>×</button>
            </div>
            
            <div className="detail-content">
              <div className="detail-row">
                <span className="detail-label">Product Name</span>
                <span className="detail-value">{selectedProduct.name}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">SKU</span>
                <span className="detail-value sku-detail">{selectedProduct.sku}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value">{selectedProduct.description || 'No description available'}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`detail-value status-badge ${selectedProduct.active ? 'active' : 'inactive'}`}>
                  {selectedProduct.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="detail-actions">
              <button onClick={() => {
                setIsDetailOpen(false);
                handleEditClick(selectedProduct);
              }}>Edit Product</button>
              <button 
                className="danger-btn" 
                onClick={() => {
                  setIsDetailOpen(false);
                  handleDeleteClick(selectedProduct.id);
                }}
              >
                Delete Product
              </button>
              <button className="cancel-btn" onClick={() => setIsDetailOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Dialog for Create/Edit --- */}
      {isDialogOpen && (
        <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{isEditing ? 'Edit Product' : 'Create Product'}</h2>
              <button className="dialog-close" onClick={() => setIsDialogOpen(false)}>×</button>
            </div>
            
            <form className="dialog-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="sku">SKU</label>
                <input 
                  type="text" 
                  name="sku" 
                  placeholder="SKU-123"
                  value={form.sku}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Product Name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description" 
                  placeholder="Optional description..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>
              <div className="form-group form-group-checkbox">
                <input 
                  type="checkbox" 
                  name="active" 
                  id="active"
                  checked={form.active}
                  onChange={handleFormChange}
                />
                <label htmlFor="active">Active</label>
              </div>
              
              {formError && <p className="dialog-error">{formError}</p>}
              
              <div className="dialog-actions">
                <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Section 1: Controls (Create, Search, Delete All) --- */}
      <div className="product-controls">
        <button className="create-btn" onClick={handleCreateClick}>
          + Create Product
        </button>
        <form onSubmit={handleSearch}>
          <input 
            type="search" 
            placeholder="Search by SKU, name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <button className="delete-all-btn" onClick={handleBulkDelete}>
          Delete All Products
        </button>
      </div>
      
      {/* --- Section 2: Product List/Grid --- */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <div className="product-grid">
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleViewDetails(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{product.name}</h3>
                  <span className="sku">{product.sku}</span>
                  <p>{product.description || "No description available."}</p>
                  
                  {/* --- Single Product Actions (Story 2) --- */}
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditClick(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- Section 3: Pagination --- */}
          <div className="pagination-controls">
            <button onClick={handlePrevious} disabled={!pageInfo.previous}>
              Previous
            </button>
            <span>Page {currentPage} of {pageInfo.totalPages}</span>
            <button onClick={handleNext} disabled={!pageInfo.next}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;