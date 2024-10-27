import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';
const APIContext = createContext();


const APIProvider = ({ children }) => {
  const [user,setUser]=useState(JSON.parse(localStorage.getItem("user")));
  const server=import.meta.env.VITE_APP_API_URL;
  
  const login=async(data)=>{
      const response= await axios.post(`${server}/login`,data)
      setUser(response.data.data);
      return response.data;
  }
  const signup=async(role,data)=>{
    const response= await axios.post(`${server}/${role}/register`,data)
    return response.data;
}
const allcourses=async(page,search,category)=>{
  const teacher=sessionStorage.getItem("teacher")
  
    if((user && user.role=="teacher") || (user && teacher) ){
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      let url=`${server}/teacher/courses?page=${page}&search=`;
      if(search){
        url+=encodeURIComponent(search)
      }
      url+="&category=";
      if(category){
        url+=category
      }
      
      if(teacher){
        url+=`&teacher=${teacher}`
      }
      
      console.log("URL is :", url);

      const response= await axios.get(`${url}`,config)
      return response.data;
    }
    else{
      let url=`${server}/course/getall?page=${page}&search=`;
      if(search){
        url+=encodeURIComponent(search)
      }
      url+="&category=";
      if(category){
        url+=category
      }
      console.log("Url is :", url);
      const response= await axios.get(`${url}`)
      return response.data;
    } 
}
const addReview=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/review/create`,data,config)
  return response.data;
}
const addCourse=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const course=sessionStorage.getItem("course");
  if(course){
    data.courseId=course;
  }
  const response= await axios.post(`${server}/course/create`,data,config)
  return response.data;
}

const allCategories=async()=>{
  const response= await axios.get(`${server}/category/getall`)
  return response.data;
}
const addCategory=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/category/add`,data,config)
  return response.data;
}
const oneCourse=async(id)=>{
  const response= await axios.get(`${server}/course/get/${id}`)
  return response.data;
}
const addVideo=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/module/addVideo`,data,config)
  return response.data;
}
const allTeachers=async(page,search)=>{
  
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  let url=`${server}/teacher/profiles?page=${page}&search=`
  if(search){
    url+=encodeURIComponent(search)
  }
  console.log("URL is :", url);
  const response= await axios.get(`${url}`,config)
  return response.data;
}
const allStudents=async(page,search)=>{
  
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  let url=`${server}/student/getall?page=${page}&search=`
  if(search){
    url+=encodeURIComponent(search)
  }
  console.log("URL is :", url);
  const response= await axios.get(`${url}`,config)
  return response.data;
}

const addModule=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/module/addFields`,data,config)
  return response.data;
}
    
const deleteTeacher=async(id)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.delete(`${server}/teacher/delete/${id}`,config)
  return response.data;
}
const deleteStudent=async(id)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.delete(`${server}/student/delete/${id}`,config)
  return response.data;
}
const getCourseUpdate=async(id)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.get(`${server}/course/getUpdate/${id}`,config)
  return response.data.data;
}


const deleteModule=async(id)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.delete(`${server}/module/delete/${id}`,config)
  return response.data;
}
const deleteCourse=async(id)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.delete(`${server}/course/delete/${id}`,config)
  return response.data;
}
const renameModule=async(id,data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.patch(`${server}/module/updateName/${id}`,data,config)
  return response.data;
}
const addComment=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/comment/add`,data,config)
  return response.data;
}
const addReply=async(data)=>{
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  };
  const response= await axios.post(`${server}/comment/addReply`,data,config)
  return response.data;
}
  const provider={
    login,signup,allcourses,addCourse,allCategories,addVideo,addModule,oneCourse,addCategory,addReview,allTeachers,allStudents,deleteTeacher,getCourseUpdate,deleteModule,renameModule,deleteStudent,deleteCourse,addComment,addReply
  }

  return (
    <APIContext.Provider value={provider}>
      {children}
    </APIContext.Provider>
  );
};

const useAPI = () => useContext(APIContext);

export { APIProvider, useAPI };