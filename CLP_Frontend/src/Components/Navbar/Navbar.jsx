import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [isUser, setIsUser] = useState(user ? true : false);
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsUser(false); 
        window.location.href='/';
    };

    return (
        <div className='bg-light'>
            <nav className="container navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand fw-bold" to="/">CLP</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style={{ '--bs-scroll-height': '100px' }}>
                            {isUser && (user.role !== "student" &&
                                <li className="nav-item">
                                    <NavLink className="nav-link" activeClassName="active-nav-link" to={`/${user.role}/manage_courses`} style={{ textDecoration: 'none' }}>Manage Courses</NavLink>
                                </li>
                            )}

                            {isUser && (user.role === "admin" &&
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" activeClassName="active-nav-link" to={`/${user.role}/manage_teachers`} style={{ textDecoration: 'none' }}>Manage Teachers</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" activeClassName="active-nav-link" to={`/${user.role}/manage_categories`} style={{ textDecoration: 'none' }}>Manage Categories</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" activeClassName="active-nav-link" to={`/${user.role}/manage_students`} style={{ textDecoration: 'none' }}>Manage Students</NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                        <form className="d-flex" role="search">
                            {isUser ? (
                                <button className="btn" style={{ backgroundColor: 'black', color: 'white', border: '1px solid white' }} type="button" onClick={handleLogout}>
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" className="btn" style={{ backgroundColor: 'black', color: 'white', border: '1px solid white' }}>
                                    Login
                                </Link>
                            )}
                        </form>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
