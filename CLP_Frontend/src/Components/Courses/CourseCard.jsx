import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';

const CourseCard = ({ data,setReload }) => {
  data.videoUrl = "https://www.youtube.com/embed/IAeGDqwXLXc";
  const { deleteCourse } = useAPI();

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate=useNavigate()
  const handleCourse=()=>{
    navigate(`/course/${data._id}`)
  }
  const handleDelete = () => {
    console.log("Delete Course :", data._id);
    deleteCourse(data._id)
    .then((res)=>{
      toast.success("Course Deleted Successfully");
      // window.location.reload();
      setTimeout(() => {
        
        setReload(prev => !prev);
      }, 5500);

    })
    .catch((err)=>{
      console.log("Error :", err);
      toast.error("Error while Deleting Course");
    })
  }

  const handleUpdate = () => {
    console.log("Update Course :", data._id);
    sessionStorage.setItem("course", data._id)
    navigate('/addcourse')
  }

  return (
    <div className="col-lg-4 p-2 col-md-6 col-sm-12">
      <ToastContainer />
      <div className='rounded p-3 shadow-sm h-100' style={{ backgroundColor: 'white' }}>
        <div className="embed-responsive embed-responsive-16by9 mb-3">
          <iframe
            title="Course Video"
            className="embed-responsive-item w-100"
            src={data.titleVideo ? data.titleVideo : data.videoUrl}
            allowFullScreen 
          />
        </div>
        <div>
          <p><strong>Course Name:</strong> {data.courseName}</p>
          <p><strong>Category:</strong> {data.categoryName  || data.category.name}</p>
          <p><strong>Description:</strong> {data.description.length > 50 ? `${data.description.slice(0, 60)} ...` : data.description}</p>
          {
            user && ((user.role === "admin" || user.role === "teacher") &&
              <div className="d-flex my-2 justify-content-end">
                <FaEdit className="icon" onClick={handleUpdate} style={{ cursor: 'pointer', color: '#007bff', fontSize: '1rem', marginRight: '10px' }} />
                <FaTrashAlt className="icon" onClick={handleDelete} style={{ cursor: 'pointer', color: 'red', fontSize: '1rem' }} />
              </div>
            )
          }
          <div onClick={handleCourse} style={{
            textAlign: 'center',
            background: 'linear-gradient(to right, #ff4b2b, #ff416c)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background 0.3s ease'
            
          }}>
            <Link to={`/course/${data._id}`} className="mb-0 fw-bold" style={{ color: 'white' }}>
              Show More {">>"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
