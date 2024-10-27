import React from 'react'
import AllCourses from '../../Components/Courses/AllCourses'
import Navbar from '../../Components/Navbar/Navbar'

const ManageCourses = () => {
  sessionStorage.removeItem("teacher");
  return (
    <>
    <Navbar />
    <AllCourses admin={true} />
    </>
  )
}

export default ManageCourses