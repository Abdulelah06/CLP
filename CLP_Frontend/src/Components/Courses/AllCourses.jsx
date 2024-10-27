import React, { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { Link } from 'react-router-dom';
import { useAPI } from "../../Contexts/APIContext";

const AllCourses = ({ admin }) => {
  const { allcourses, allCategories } = useAPI();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 12;
  const [reload, setReload] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchCourses(currentPage, searchTerm, selectedCategory);
    allCategories()
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  }, [currentPage, selectedCategory, reload]);

  const fetchCourses = (page, search, category) => {
    setLoading(true);
    allcourses(page, search, category)
      .then((response) => {
        console.log("All Courses :", response.data);
        setCourses(response.data.courses);
        setFilteredCourses(response.data.courses);
        setTotalCourses(response.data.total);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setSelectedCategory('')
    fetchCourses(1, searchTerm.trim() === '' ? null : searchTerm, selectedCategory.trim() === '' ? null : selectedCategory);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = courses.filter(course =>
      course.courseName.toLowerCase().includes(value)
    );
    setFilteredCourses(filtered);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setSearchTerm(''); // Reset search term when category is selected
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div style={{
      backgroundImage: `url("https://static.vecteezy.com/system/resources/previews/006/852/804/original/abstract-blue-background-simple-design-for-your-website-free-vector.jpg")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      imageRendering: 'auto', // or 'crisp-edges' or 'pixelated' depending on the context
      minHeight: '100vh',
    }}>
      <div className="container py-4">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" style={{ fontSize: '1.2rem' }}>
              <span className="sr-only">CLP</span>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              <div className="d-flex">
                <input
                  style={{ width: "100%", maxWidth: '350px' }}
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={handleInputChange}
                />
                <p className="btn mx-2" onClick={handleSearch}>Search</p>
                <select
                  className="form-control mb-3"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
              {admin && (
                <div>
                  <Link to="/addcourse" className='btn btn-dark rounded'>Add New Course</Link>
                </div>
              )}
            </div>

            {filteredCourses.length === 0 ? (
              <div className="text-center my-5">
                <h4 style={{ color: 'white' }}>No courses found</h4>
                <p style={{ color: 'white' }}>Courses not added yet.</p>
              </div>
            ) : (
              <div className="row">
                {filteredCourses.map(course => (
                  <CourseCard key={course._id} data={course} setReload={setReload} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" style={{ backgroundColor: 'black', color: 'white' }} onClick={goToPreviousPage}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index} className={`page-item mx-2 ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button className="page-link" style={{ backgroundColor: 'black', color: 'white' }} onClick={() => paginate(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" style={{ backgroundColor: 'black', color: 'white' }} onClick={goToNextPage}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
