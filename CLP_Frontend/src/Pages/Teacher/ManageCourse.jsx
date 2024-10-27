import React from 'react'
import AllCourses from '../../Components/Courses/AllCourses'
import Navbar from '../../Components/Navbar/Navbar'

const ManageCourse = () => {
  return (
    <>
    <Navbar />
    <AllCourses admin={true} />
    </>
  )
}

export default ManageCourse