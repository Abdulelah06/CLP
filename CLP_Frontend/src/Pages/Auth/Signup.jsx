import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom for routing
import StudentForm from '../../Components/Registration/StudentForm';
import TeacherForm from '../../Components/Registration/TeacherForm';

const Registration = () => {
  const [isStudentForm, setIsStudentForm] = useState(false);


  const toggleForm = () => {
    setIsStudentForm(!isStudentForm);
  };

  return (
    <section className="background-radial-gradient overflow-hidden">
      <style>
        {`
          .background-radial-gradient {
            background-color: hsl(218, 41%, 15%);
            background-image: url("https://img.freepik.com/free-vector/gradient-connection-background_52683-118592.jpg");
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
        `}
      </style>

      <div className="container-fluid py-2  d-flex justify-content-center align-items-center" style={{minHeight:'100vh'}}>
        <div className="row gx-lg-5 align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="my-5 display-5 fw-bold text-light">
              Register Your Account
            </h1>
            <p className="mb-4 text-light opacity-70">
              Fill out the form below to create your account.
            </p>
            <p className="text-light">
              Already have an account? <Link to="/login" className="text-decoration-none text-light fw-bold">Login</Link>
            </p>
            <button className="switch-button" onClick={toggleForm}>
              Switch to {isStudentForm ? 'Teacher' : 'Student'} Registration
            </button>
          </div>

          <div className="col-lg-6 position-relative">
            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                {isStudentForm ? <StudentForm /> : <TeacherForm />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;
