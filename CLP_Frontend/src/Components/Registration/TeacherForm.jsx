import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAPI } from "../../Contexts/APIContext";
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom for routing
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TeacherForm = () => {
    const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();
    const { signup } = useAPI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        delete data.confirmPassword;
        setLoading(true);
        signup('teacher', data)
            .then((res) => {
                setLoading(false);
                if (res.success) {
                  toast.success('An email with your account confirmation has been sent to your email.');
                  reset(); 
                    setTimeout(() => {
                        navigate('/login');
                    }, 5500); 
                } else {
                    toast.error('Registration failed. Please try again.');
                }
            })
            .catch((err) => {
                setLoading(false);
                console.error("Error :", err);
                toast.error('Registration failed. Please try again.');
            });
    };

    return (
        <>
            <ToastContainer /> 
            <form onSubmit={handleSubmit(onSubmit)} style={{ color: 'black' }}>
              <h3>Register as Teacher</h3>
                <div className="row">
                    
                    <div className="form-outline mb-4 col-md-6">
                        <label className="form-label" htmlFor="fullName">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            className={`form-control p-2 ${errors.fullName ? 'is-invalid' : ''}`}
                            placeholder="Enter Full Name"
                            {...register("fullName", { required: "Full Name is required" })}
                        />
                        {errors.fullName && (
                            <p className="error-message">{errors.fullName.message}</p>
                        )}
                    </div>               
                    <div className="form-outline mb-4 col-md-6">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={`form-control p-2 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter Email Address"
                            {...register("email", { required: "Email is required" })}
                        />
                        {errors.email && (
                            <p className="error-message">{errors.email.message}</p>
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="form-outline mb-4 col-md-6">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={`form-control p-2 ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter Password"
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && (
                            <p className="error-message">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="form-outline mb-4 col-md-6">
                        <label className="form-label" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={`form-control p-2 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Confirm Password"
                            {...register("confirmPassword", { required: "Confirm Password is required" })}
                        />
                        {errors.confirmPassword && (
                            <p className="error-message">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-4" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </>
    );
};

export default TeacherForm;
