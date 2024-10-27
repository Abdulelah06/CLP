import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AddCourseForm from '../../Components/Courses/AddCourseForm';
import AddModules from '../../Components/Courses/AddModules';
import Navbar from '../../Components/Navbar/Navbar';

const AddCourse = () => {
  let step=sessionStorage.getItem("courseData");
  const sessionCourse = sessionStorage.getItem('course');

  return (
    <>
    <Navbar />
    

    <section className="background-radial-gradient overflow-hidden">
      <style>
        {`
          .background-radial-gradient {
            background-color: hsl(218, 41%, 15%);
            background-image: url("https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
            background-size: cover;
          }

          .bg-glass {
            background-color: hsla(0, 0%, 100%, 0.9) !important;
            backdrop-filter: saturate(200%) blur(25px);
          }

          /* Additional styling for error messages */
          .error-message {
            color: red;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          /* Styling for switch button */
          .switch-button {
            font-size: 1.25rem;
            font-weight: bold;
            color: #fff;
            background-color: #007bff;
            border: none;
            padding: 0.5rem 1rem;
            margin-top: 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .switch-button:hover {
            background-color: #0056b3;
          }

          /* Increase the width of the form */
          .form-container {
            max-width: 800px;
            margin: auto;
          }

          /* Update the background color of the form */
          .bg-glass {
            background-color: hsla(0, 0%, 95%, 0.9) !important;
          }
        `}
      </style>

      <div className={`container py-2 rounded ${!step && "d-flex" }justify-content-center align-items-center`} style={{ minHeight: '100vh' }}>
        <div className="row gx-lg-5 align-items-center justify-content-center">
          {
            !step &&
          <div className="col-lg-4 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="my-5 display-5 fw-bold text-light">
                {sessionCourse?"Update ": "Add a New "}   Course
            </h1>
            <p className="mb-4 text-light opacity-70">
              Fill out the form below to {sessionCourse?"Update ": "Add a New "}  course to the platform.
            </p>
            <p className="text-light">
              Go back to <Link to="/" className="text-decoration-none text-light fw-bold">Home</Link>
            </p>
          </div>
          }

          <div className="col-lg-8">
            <div className="bg-glass rounded p-4">
              {
                step?<AddModules />:<AddCourseForm />
              }
              
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default AddCourse;
