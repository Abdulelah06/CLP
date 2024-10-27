import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';
import Home from './Pages/Home/Home';
import NotFound from './Pages/ErrorPages/NotFound';
import AddCourse from './Pages/Courses/AddCourse';
import ManageCourses from './Pages/Admin/ManageCourses';
import ManageCourse from './Pages/Teacher/ManageCourse';
import Course from './Pages/Courses/Course';
import ManageCategories from './Pages/Admin/ManageCategories';
import ManageTeachers from './Pages/Admin/ManageTeachers';
import ManageStudents from './Pages/Admin/manageStudents';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/addcourse" element={<AddCourse />} />
                    <Route path="/admin/manage_courses" element={<ManageCourses />} />
                    <Route path="/admin/manage_categories" element={<ManageCategories />} />
                    <Route path="/admin/manage_teachers" element={<ManageTeachers />} />
                    <Route path="/admin/manage_students" element={<ManageStudents />} />
                    <Route path="/teacher/manage_courses" element={<ManageCourse />} />
                    <Route path="/course/*" element={<Course />} />
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
