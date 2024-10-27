import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { useAPI } from "../../Contexts/APIContext";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddModules = () => {
  const courseData = JSON.parse(sessionStorage.getItem("courseData"));
  const modules = courseData.modules;

  const { register, handleSubmit, reset } = useForm();
  const { addVideo, addModule } = useAPI();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [fields, setFields] = useState([{ name: "", content: [], contentType: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const handleAddField = () => {
    if (fields.length < 5) {
      setFields([...fields, { name: "", content: [], contentType: "" }]);
    }
  };

  const handleFieldNameChange = (index, value) => {
    const newFields = [...fields];
    newFields[index].name = value;
    setFields(newFields);
  };

  const handleContentChange = (fieldIndex, contentIndex, value) => {
    const newFields = [...fields];
    newFields[fieldIndex].content[contentIndex].value = value;
    setFields(newFields);
  };

  const handleContentTypeChange = (fieldIndex, contentType) => {
    const newFields = [...fields];
    newFields[fieldIndex].contentType = contentType;
    setFields(newFields);
  };

  const handleVideoUpload = async (fieldIndex, file) => {
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    const newFields = [...fields];
    newFields[fieldIndex].content = [{ type: 'video', value: videoUrl }];
    setFields(newFields);

    document.getElementById(`file-upload-${fieldIndex}`).value = '';
    setIsLoading(true);

    const formData = new FormData();
    formData.append('moduleId', modules[currentModuleIndex].moduleId);
    formData.append('index', fieldIndex);
    formData.append('video', file);
    console.log("Form Data :", Object.fromEntries(formData));
    try {
      await addVideo(formData);
      toast.success('File upload successful', { autoClose: 5000 });
    } catch (error) {
      toast.error('Error uploading video', { autoClose: 5000 });
      console.log("Error :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoRemove = (fieldIndex) => {
    const newFields = [...fields];
    newFields[fieldIndex].content = [];
    setFields(newFields);
  };

  const onSubmit = (data) => {
    data.moduleId = modules[currentModuleIndex].moduleId;
    console.log("Fields to beSubmitted", data);
    addModule(data)
      .then((res) => {
        console.log("Response is :", res);
        if (currentModuleIndex < modules.length - 1) {
          setCurrentModuleIndex(currentModuleIndex + 1);
          reset();
          setFields([{ name: "", content: [], contentType: "" }]);
        } else {
          toast.success("All Modules Added Successfully!");
          sessionStorage.removeItem("courseData");
          setTimeout(() => {
            navigate('/')
          }, 3000);
        }
      })
      .catch((err) => {
        toast.error("There is an error while creating Module");
        console.log("Error :", err);
      })

  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">ADD MODULES DATA</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h4>{modules[currentModuleIndex].moduleName}</h4>
        {fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className="mb-3">
            <div className="form-group row align-items-center">
              <div className="col-md-6">
                <label htmlFor={`field-name-${fieldIndex}`} className="me-2">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id={`field-name-${fieldIndex}`}
                  placeholder="Enter field name"
                  onChange={(e) => handleFieldNameChange(fieldIndex, e.target.value)}
                  {...register(`fields.${fieldIndex}.name`)}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor={`content-type-${fieldIndex}`} className="me-2">Content Type</label>
                <select
                  className="form-control"
                  id={`content-type-${fieldIndex}`}
                  onChange={(e) => handleContentTypeChange(fieldIndex, e.target.value)}
                  value={field.contentType}
                >
                  <option value="">Select Content Type</option>
                  <option value="text">Text</option>
                  <option value="video">File</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              {field.contentType === 'text' && (
                <div className="form-group">
                  <label htmlFor={`field-text-${fieldIndex}`} className="me-2">Text Content</label>
                  <textarea
                    className="form-control"
                    id={`field-text-${fieldIndex}`}
                    rows={7}
                    placeholder="Enter text content"
                    onChange={(e) => handleContentChange(fieldIndex, 0, e.target.value)}
                    {...register(`fields.${fieldIndex}.content`)}
                  />
                </div>
              )}
              {field.contentType === 'video' && (
                <div className="form-group position-relative">
                  {!field.content.some(content => content.type === 'video') && (
                    <div
                      type="button"
                      className="w-100 mt-2"
                      onClick={() => document.getElementById(`file-upload-${fieldIndex}`).click()}
                    >
                      <img
                        src="https://ruttl.com/assets/img/upload-video-from-system.png"
                        width={"100%"}
                        height={300}
                        alt="Upload Video Placeholder"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*,application/pdf"
                    id={`file-upload-${fieldIndex}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleVideoUpload(fieldIndex, e.target.files[0])}
                  />
                  {field.content.map((content, contentIndex) => (
                    content.type === 'video' && (
                      <div key={contentIndex} className="mt-2 position-relative">
                        {isLoading && (
                          <div className="video-loader">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}
                        {!isLoading && (
                          <FaTimes
                            className="position-absolute text-danger"
                            style={{ top: 0, right: 0, cursor: 'pointer' }}
                            onClick={() => handleVideoRemove(fieldIndex)}
                          />
                        )}
                        <iframe
                          src={content.value}
                          width="100%"
                          height="200"
                          style={{ marginTop: '10px' }}
                          frameBorder="0"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {fields.length < 5 && (
          <button
            type="button"
            className="btn btn-primary mt-2 black_btn"
            onClick={handleAddField}
          >
            Add Field
          </button>
        )}
        <button type="submit" className="btn btn-success w-100 mt-4 black_btn">Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddModules;