import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAPI } from "../../Contexts/APIContext";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAPI();
  const [loading, setLoading] = useState(false);

  const onSubmit = (data) => {
    setLoading(true);
    console.log(data);
    login(data)
      .then((res) => {
        console.log("Response is :", res);
        if (res.success) {
          localStorage.setItem("user", JSON.stringify(res.data));
          toast.success('Login successful!');
          navigate('/');
        } else {
          console.log("Error :", res.message);
          toast.error(res.message || 'Login failed. Please check your credentials.');
        }
      })
      .catch((err) => {
        console.log("Error is :", err);
        toast.error('An error occurred. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
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

          .error-message {
            color: red;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        `}
      </style>

      <ToastContainer />

      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="row gx-lg-5 align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="my-5 display-5 fw-bold text-light">
              Login to Your Account
            </h1>
            <p className="mb-4 text-light opacity-70">
              Enter your email and password to log in.
            </p>
            <p className="text-light">
              Don't have an account? <Link to="/signup" className="text-decoration-none text-light fw-bold">Register</Link>
            </p>
          </div>

          <div className="col-lg-6 position-relative">
            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                <form onSubmit={handleSubmit(onSubmit)} style={{ color: 'black' }}>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="email">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-control p-3 ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter Email Address"
                      {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && (
                      <p className="error-message">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={`form-control p-3 ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter Password"
                      {...register("password", { required: "Password is required" })}
                    />
                    {errors.password && (
                      <p className="error-message">{errors.password.message}</p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-4" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
