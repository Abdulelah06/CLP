import React from 'react';
import { useAPI } from "../../Contexts/APIContext";
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { toast } from 'react-toastify';

const StudentCard = ({ student }) => {
  const { fullName, email } = student;
  const { deleteStudent } = useAPI(); 

  const handleDelete = () => {
    deleteStudent(student._id)
    .then((res)=>{
      toast.success(`Student Deleted: ${fullName}`);
      setTimeout(() => {
        
        window.location.reload();
      }, 5500);
    })
    .catch((err)=>{
      console.log("Error :",err);
      toast.error("Error while Deleting Student");
    })
  };

  // const handleUpdate = () => {
  //   console.log("Update Student :", student._id); 
  // };

  return (
    <div className='col-lg-4 col-md-6 col-sm-12 p-2'>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{fullName}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{student.userId.email}</h6>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            Joined: {new Date(student.createdAt).toLocaleDateString()}
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

export default StudentCard;
