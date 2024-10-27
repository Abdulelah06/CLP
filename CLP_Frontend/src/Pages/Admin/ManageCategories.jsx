import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ManageCategories.css'; // Import the custom CSS file

const ManageCategories = () => {
  const { allCategories, addCategory } = useAPI();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    fetchCategories(); // Initial fetch when component mounts
  }, []);

  const fetchCategories = () => {
    setLoading(true); // Set loading to true when fetching categories
    allCategories()
      .then((res) => {
        console.log("Response Data");
        setCategories(res.data.categories); 
      })
      .catch((err) => {
        console.log("Error is :", err);
        toast.error("Failed to fetch categories");
      })
      .finally(() => {
        setLoading(false); // Set loading to false after fetch completes
      });
  };

  const handleAddCategory = () => {
    setLoading(true); // Set loading to true when adding category
    const data = {
      name: newCategoryName
    }
    addCategory(data)
      .then((res) => {
        console.log("Response is:", res);
        toast.success("Category added successfully");
        setShowModal(false);
        setNewCategoryName('');
        fetchCategories();
      })
      .catch((err) => {
        console.log("Error is :", err);
        toast.error("Failed to add category");
      })
      .finally(() => {
        setLoading(false); // Set loading to false after category is added (success or failure)
      });
  };

  return (
    <>
      <Navbar />
      <div className="manage-categories-background">
        <div className="manage-categories-container">
          <div className="manage-categories-header">
            <h1 className="text-dark">All Categories:</h1>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>ADD CATEGORY</button>
          </div>
          {loading ? (
            <div className="manage-categories-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="manage-categories-list">
              {categories.map(category => (
                <div key={category._id} className="manage-categories-item">
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding category */}
      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Category</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <input type="text" className="form-control mb-2" placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleAddCategory}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
}

export default ManageCategories;
