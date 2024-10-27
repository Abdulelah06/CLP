import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentCard from '../../Components/Students/StudentCard';
import { Link } from 'react-router-dom';

const ManageStudents = () => {
    const { allStudents } = useAPI(); // Assuming you have a function to fetch all students
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 9;

    useEffect(() => {
        fetchStudents(currentPage, searchTerm);
    }, [currentPage]);

    const fetchStudents = (page, search) => {
        setLoading(true);
        allStudents(page, search) // Adjust this to match your API call for fetching students
            .then((res) => {
                console.log("Response :", res.data);
                setStudents(res.data.students);
                setFilteredStudents(res.data.students);
                setTotalStudents(res.data.total);
                setTotalPages(res.data.totalPages);
            })
            .catch((err) => {
                console.log("Error :", err);
                toast.error("Failed to fetch students");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to the first page when searching
        fetchStudents(1, searchTerm);
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        // No need to filter students here; handle it via the API call
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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
        <>
            <Navbar />
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
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 style={{ color: 'white', marginBottom: '20px' }}>All Students</h1>
                        <Link to="/signup" className="btn btn-primary">ADD Student</Link> {/* Update link for adding students */}
                    </div>
                    <div className="mb-4 d-flex">
                        <input
                            type="text"
                            className="form-control w-50 me-2"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={handleInputChange}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                    </div>
                    <div className="row">
                        {loading ? (
                            <div className="text-center my-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">CLP</span>
                                </div>
                            </div>
                        ) :
                        (
                            filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <StudentCard key={student._id} student={student} /> 
                                ))
                            ) : (
                                <div className="text-center my-5">
                                    <h4 style={{ color: 'white' }}>No students found</h4>
                                </div>
                            )
                        )}
                    </div>
                    {totalPages > 1 && (
                        <nav className="mt-4">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={goToPreviousPage}>
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button className="btn mx-2" onClick={() => paginate(index + 1)}>
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={goToNextPage}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default ManageStudents;
