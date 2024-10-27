import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TeacherCard from '../../Components/Teacher/TeacherCard';
import { Link } from 'react-router-dom';

const ManageTeachers = () => {
    const { allTeachers } = useAPI();
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [totalTeachers, setTotalTeachers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 9;

    useEffect(() => {
        fetchTeachers(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const fetchTeachers = (page, search) => {
        setLoading(true);
        allTeachers(page, search)
            .then((res) => {
                console.log("Response :", res.data);
                setTeachers(res.data.teachers);
                setFilteredTeachers(res.data.teachers);
                setTotalTeachers(res.data.total);
                setTotalPages(res.data.totalPages);
            })
            .catch((err) => {
                console.log("Error :", err);
                toast.error("Failed to fetch teachers");
            })
            .finally(() => {
                setLoading(false); 
            });
    };

    const handleSearch = () => {
        setCurrentPage(1); // Reset to the first page when searching
        fetchTeachers(1, searchTerm);
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
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
                        <h1 style={{ color: 'white', marginBottom: '20px' }}>All Teachers</h1>
                        <Link to="/signup" className="btn">ADD Teacher</Link>
                    </div>
                    <div className="mb-4 d-flex">
                        <input
                            type="text"
                            className="form-control w-50 me-2"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={handleInputChange}
                        />
                        <button className="btn btn-primary ml-2" onClick={handleSearch}>Search</button>
                    </div>
                    <div className="row">
                        {loading ? (
                            <div className="text-center my-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">E-Learning</span>
                                </div>
                            </div>
                        ) : (
                            filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <TeacherCard key={teacher._id} teacher={teacher} />
                                ))
                            ) : (
                                <div className="text-center my-5">
                                    <h4 style={{ color: 'white' }}>No teachers found</h4>
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

export default ManageTeachers;
