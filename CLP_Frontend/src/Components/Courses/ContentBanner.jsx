import React, { useEffect, useState } from 'react';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';
import { FaPenClip } from 'react-icons/fa6';
import './ContentBanner.css';

const ContentBanner = ({ data }) => {
    const [show, setShow] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedField, setEditedField] = useState(null);
    const [newFieldName, setNewFieldName] = useState(editedField ? editedField.name : '');
    const [newContentType, setNewContentType] = useState('');
    const { addVideo, addModule } = useAPI();
    const [isRotated, setIsRotated] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"))

    const handleShow = () => {
        setShow(!show);
        setIsRotated(!isRotated); // Toggle rotation
    };
    const handleContentClick = (field) => {
        setModalContent(field);
    };
    const closeModal = () => {
        setModalContent(null);
    };
    const handleEditClick = (e, field, index) => {
        e.stopPropagation();
        setEditedField({ ...field, index });
        setNewFieldName(field.name);
        setNewContentType(field.content.startsWith('http') ? 'video/mp4' : 'text');
        setEditModalOpen(true);
    };
    const addField=()=>{
        if(data.fields.length<5){

            const filteredData = {
                moduleId: data._id,
                fields: [
                    ...data.fields.map(({ name, content }) => ({ name, content })),
                    { name: "New Field", content: "NA" }
                ]
            };
            addModule(filteredData)
                .then((res) => {
                    console.log("Response :", res);
                    toast.success("Empty Field Created");
                    setTimeout(() => {
        
                        window.location.reload();
                      }, 5500);
                })
                .catch((err) => {
                    console.log("Error :", err);
                    toast.error("An error occurred while adding the module");
                });
        }

    }
    const noNull = (fieldIndex) => {
            const newData = JSON.parse(JSON.stringify(data));
            delete newData.fields[fieldIndex].content;

            const filteredData = {
                moduleId: newData._id,
                fields: newData.fields.map(({ name, content }) => ({ name, content }))
            };
            addModule(filteredData)
                .then((res) => {
                    console.log("Response :", res);
                })
                .catch((err) => {
                    console.log("Error :", err);
                    toast.error("An Error occured while deleting field")
                })
        }
        const handleDeleteClick = (e, field) => {
            e.stopPropagation();
            console.log("Field is :", field);
            console.log("Data is :", data);
            const updatedFields = data.fields.filter(f => f._id !== field._id);
            const filteredData = {
                moduleId: data._id,
                fields: updatedFields.map(({ name, content }) => ({ name, content }))
            };
            addModule(filteredData)
                .then((res) => {
                    toast.success("Field Deleted Successfully")
                    setTimeout(() => {
                        window.location.reload();
                    }, 5500);
                })
                .catch((err) => {
                    console.log("Error :", err);
                    toast.error("An Error occured while deleting field")
                })
        };

        const handleContentTypeChange = (value) => {
            setNewContentType(value);
            setEditedField({ ...editedField, content: '' }); // Clear content when content type changes
        };
        const onFileUpload = async (file, index) => {
            const formData = new FormData();
            formData.append('moduleId', data._id);
            formData.append('index', index);
            formData.append('video', file);
            try {
                await addVideo(formData);
                noNull(index);
                toast.success('File upload successful', { autoClose: 5000 });
            } catch (error) {
                toast.error('Error uploading File', { autoClose: 5000 });
                console.log("Error :", error);
            }
        }
        const EditModal = () => {
            const [fileUrl, setFileUrl] = useState(null);
            const [newFieldName, setNewFieldName] = useState(editedField ? editedField.name : '');
            const [content, setContent] = useState(editedField?.content || '')

            const handleSaveEdit = () => {
                const updatedField = {
                    ...editedField,
                    name: newFieldName,
                    content: newContentType === 'video/mp4' ? null : content,
                };
                const updatedModule = {
                    ...data,
                    fields: data.fields.map((field, index) => index === editedField.index ? updatedField : field),
                };
                updatedModule.fields = updatedModule.fields.map(field => ({
                    name: field.name,
                    content: field.content
                }));
                updatedModule.fields.forEach(field => {
                    if (field.content === null || field.content === '') {
                        delete field.content;
                    }
                });
                delete updatedModule.moduleName;
                updatedModule.moduleId = updatedModule._id;
                delete updatedModule._id;
                console.log("Updated Module :", updatedModule);
                addModule(updatedModule)
                    .then((res) => {
                        toast.success("Module Edited Successfully")
                        setEditModalOpen(false);
                        setTimeout(() => {
                            window.location.reload();
                        }, 5500);
                    })
                    .catch((err) => {
                        console.log("Error :", err);
                        toast.error("Error while updating Module")
                    })
            };
            const handleFileChange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.type === 'application/pdf' || file.type === 'video/mp4') {
                        // Create a URL for the file to display in iframe
                        const fileUrl = URL.createObjectURL(file);
                        setFileUrl(fileUrl);

                        onFileUpload(file, editedField.index);
                    } else {
                        console.log('Only PDF or MP4 files are allowed.');
                    }
                }
            };

            return (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" aria-labelledby="editModalTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="editModalTitle">Edit Field</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setEditModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="fieldName" className="form-label">Field Name</label>
                                    <input type="text" className="form-control" id="fieldName" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="contentType" className="form-label">Content Type</label>
                                    <select className="form-select" id="contentType" value={newContentType} onChange={(e) => handleContentTypeChange(e.target.value)}>
                                        <option value="text">Text</option>
                                        <option value="video/mp4">File</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    {newContentType === "text" ? (
                                        <textarea className='form-control' rows={5} value={content} onChange={(e) => setContent(e.target.value)} ></textarea>
                                    ) : (
                                        <>
                                            <input type="file" accept=".pdf,.mp4" className='form-control' onChange={handleFileChange} />

                                            {fileUrl && (
                                                <iframe
                                                    src={fileUrl}
                                                    style={{ width: '100%', height: '500px', marginTop: '10px' }}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                >
                                                    Your browser does not support iframes.
                                                </iframe>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div>
                <div className="row my-3" style={{ border: '1px solid #ededed', borderRadius: '15px' }}>
                    <ToastContainer />
                    <div className="d-flex p-2 px-4 justify-content-between" onClick={handleShow} style={{ backgroundColor: '#f7f8fb', border: '1px solid transparent', borderRadius: '15px', cursor: 'pointer' }}>
                        <div className="left d-flex align-items-center">
                            <svg className={`content-banner-pen-icon ${isRotated ? 'rotated' : 'rotating'}`} fill="#000000" height="15px" width="15px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xmlSpace="preserve">
                                <path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
                            </svg>
                            <span className='mx-3' style={{ fontSize: '17px', fontWeight: '500', color: '#140342' }}>
                                {data.moduleName}
                            </span>
                        </div>
                    </div>
                    {show &&
                        <div>
                            {data.fields.map((field, index) => (
                                <div key={field._id} className="d-flex align-items-center my-4 ms-4">
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                        <div className='d-flex'>
                                            <div className='rounded-circle d-flex justify-content-center align-items-center mx-2' style={{ backgroundColor: '#f4f1fe', height: '25px', width: '25px' }}>
                                                {field.content.startsWith('http') && field.content.endsWith('.mp4') ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4f547b" className="bi bi-play" viewBox="0 0 16 16">
                                                        <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z" />
                                                    </svg>
                                                ) : field.content.endsWith('.pdf') ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#4f547b" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                                                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3-.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V4h3v-.5zm0 1v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6H6z" />
                                                    </svg>
                                                ) : (
                                                    <FaPenClip />

                                                )}
                                            </div>
                                            <span style={{ color: '#140342', fontSize: '16px' }}>
                                                {field.name}
                                            </span>
                                        </div>
                                        <div className='d-flex align-items-center'>
                                            <span onClick={() => handleContentClick(field)} style={{ cursor: 'pointer' }}>Show Content</span>
                                            {
                                                user && (
                                                    (user.role === "admin" || user.role === "teacher") &&
                                                    <>
                                                        <span className="mx-2 text-primary" onClick={(e) => handleEditClick(e, field, index)} style={{ cursor: 'pointer' }}>
                                                            <BsPencilSquare />
                                                        </span>
                                                        <span className="text-danger" onClick={(e) => handleDeleteClick(e, field)} style={{ cursor: 'pointer' }}>
                                                            <BsTrash />
                                                        </span>
                                                    </>

                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {
                                data.fields.length<5 && ( 
                                    user && (
                                        (user.role === "admin" || user.role === "teacher") &&
                                        <div className="d-flex justify-content-end">
                                            <button className='btn my-2' onClick={addField}>Add Field</button>
                                        </div>
                                    )
                                )
                            }
                        </div>
                    }
                </div>
                {modalContent && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg" style={{ width: '90vw' }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLongTitle">{modalContent.name}</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body">
                                    {modalContent.content.startsWith('http') && (modalContent.content.endsWith('.mp4') || modalContent.content.endsWith('.pdf')) ? (
                                        <iframe
                                            src={modalContent.content}
                                            style={{ width: '100%', height: '500px' }}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        >
                                            Your browser does not support iframes.
                                        </iframe>
                                    ) : (
                                        <p>{modalContent.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {editModalOpen && <EditModal />}
            </div>
        );
    };

    export default ContentBanner;
