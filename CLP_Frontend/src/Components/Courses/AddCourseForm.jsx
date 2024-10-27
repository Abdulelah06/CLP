import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAPI } from "../../Contexts/APIContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddCourseForm = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { addCourse, allCategories, getCourseUpdate, deleteModule, renameModule } = useAPI();
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const sessionCourse = sessionStorage.getItem('course');
  const navigate=useNavigate();
  useEffect(() => {
    if (sessionCourse) {
      getCourseUpdate(sessionCourse)
        .then((res) => {
          const courseData = res;
          setValue("courseName", courseData.courseName);
          setValue("category", courseData.categoryId); 
          setValue("description", courseData.description);
          setModules(courseData.modules.map(module => ({ moduleName: module.moduleName, moduleId: module._id })));
        })
        .catch((err) => {
          console.error("Error fetching course data:", err);
        });
    }

    allCategories()
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
      });
  }, [allCategories, getCourseUpdate, sessionCourse, setValue]);

  const onSubmit = (data) => {
    setIsLoading(true);
    const newModules = modules.filter(module => module.moduleId === null).map(module => module.moduleName);
    data.modules = newModules;
    addCourse(data)
      .then((res) => {
        setIsLoading(false);
        if (res.success) {
          
          toast.success('Course added successfully!');
          
          if (sessionCourse){
            sessionStorage.removeItem("course")
            navigate(`/course/${sessionCourse}`)
          }
          else{
            sessionStorage.setItem("courseData", JSON.stringify(res.data));
            setTimeout(() => {
              window.location.reload();
            }, 3000); 
          }
        } else {
          toast.error(res.message || 'Failed to add course. Please try again later.');
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.error('Error:', err);
        toast.error('Failed to add course. Please try again later.');
      });
  };

  const handleAddModule = () => {
    if (modules.length < 5) {
      setModules([...modules, { moduleName: "", moduleId: null }]);
    } else {
      toast.warning('You can only add up to 5 modules.');
    }
  };

  const handleModuleChange = (index, event) => {
    const newModules = [...modules];
    newModules[index].moduleName = event.target.value;
    setModules(newModules);
  };

  const handleRemoveModule = (index, moduleId) => {
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
    if (moduleId){
      deleteModule(moduleId)
      .then((res)=>{
          toast.success("Module Removed")
      })
      .catch((err)=>{
          toast.error("Error while removing Module")
          console.log("Error :", err);
      })
    }
  };

  const handleRenameModule = (index) => {
    const module = modules[index];
    const data={
      moduleName:module.moduleName
    }
    if (module.moduleId){
      renameModule(module.moduleId,data)
      .then((res)=>{
          toast.success("Module Renamed")
      })
      .catch((err)=>{
          toast.error("Error while removing Module")
          console.log("Error :", err);
      })
    }
  };

  return (
    <div className="form">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <h2 className="text-center mb-4">Add New Course</h2>
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label" htmlFor="courseName">Course Name</label>
            <input
              type="text"
              id="courseName"
              className={`form-control ${errors.courseName ? 'is-invalid' : ''}`}
              placeholder="Enter Course Name"
              {...register("courseName", { required: "Course Name is required" })}
            />
            {errors.courseName && (
              <p className="error-message">{errors.courseName.message}</p>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              className={`form-control ${errors.category ? 'is-invalid' : ''}`}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
            {errors.category && (
              <p className="error-message">{errors.category.message}</p>
            )}
          </div>
        </div>
        <div className="row mb-4">
          {modules.map((module, index) => (
            <div key={index} className="col-md-12 mb-4">
              <label className="form-label" htmlFor={`module-${index}`}>Module {index + 1}</label>
              <input
                type="text"
                id={`module-${index}`}
                className="form-control"
                placeholder={`Enter Module ${index + 1} Name`}
                value={module.moduleName}
                onChange={(e) => handleModuleChange(index, e)}
              />
              <button
                type="button"
                className="btn btn-danger mt-2"
                style={{backgroundColor:'#c14141'}}
                onClick={() => handleRemoveModule(index, module.moduleId)}
              >
                Remove Module
              </button>
              <button
                type="button"
                className="btn btn-primary mt-2  mx-2"
                onClick={() => handleRenameModule(index)}
              >
                Rename Module
              </button>
            </div>
          ))}
        </div>
        {modules.length < 5 && (
          <div className="row mb-4">
            <div className="col-md-6">
              <button
                type="button"
                className="btn black_btn"
                onClick={handleAddModule}
              >
                Add Module
              </button>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            placeholder="Enter Course Description"
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && (
            <p className="error-message">{errors.description.message}</p>
          )}
        </div>
        <button type="submit" className="btn black_btn w-100 mb-4" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Next'}
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm;
