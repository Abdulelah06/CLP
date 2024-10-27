import React from 'react';
import { useAPI } from "../../Contexts/APIContext";
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const TeacherCard = ({ teacher }) => {
  const { fullName } = teacher;
  const navigate=useNavigate()
  const { deleteTeacher } = useAPI();
  const handleCourses=()=>{
    sessionStorage.setItem("teacher",teacher.userId._id)
    navigate('/')

  }
  const handleDelete = ({update,setUpdate}) => {
    deleteTeacher(teacher._id)
      .then(() => {
        toast.success(`Successfully deleted: ${fullName}`);
        setTimeout(() => {
        
          window.location.reload();
        }, 5500);
        
      })
      .catch((error) => {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      });
  };

  const handleUpdate = () => {
    toast.info(`Update action for ${fullName}`);
  };

  return (
    <div className='col-lg-4 col-md-6 col-sm-12 p-2'>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{fullName}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{teacher.userId.email}</h6>
          <p onClick={handleCourses} style={{ color:'blue', cursor:'pointer'}}>Show Courses {">>"}</p>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            Joined: {new Date(teacher.createdAt).toLocaleDateString()}
          </div>
          <div>
            {/* <span className="mx-2 text-primary" onClick={handleUpdate} style={{cursor:'pointer'}} >
              <BsPencilSquare />
            </span> */}
            <span className="text-danger" onClick={handleDelete} style={{cursor:'pointer'}}>
              <BsTrash />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherCard;
