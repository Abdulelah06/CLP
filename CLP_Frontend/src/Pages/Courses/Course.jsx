import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import ContentBanner from "../../Components/Courses/ContentBanner";
import AllReviews from '../../Components/Courses/AllReviews';
import CommentList from '../../Components/Courses/CommentList'; 
import { useAPI } from "../../Contexts/APIContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Course = () => {
  const [courseId, setCourseId] = useState(null);
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(true); 
  const [reviewText, setReviewText] = useState(''); 
  const [commentText, setCommentText] = useState('');
  const { oneCourse, addReview, addComment } = useAPI();
  const [reviewed,setReviewed]=useState(false)
  const user=localStorage.getItem("user");
  useEffect(() => {
    const path = window.location.pathname.split("/");
    if (path.length === 3) {
      const id = path[2];
      oneCourse(id)
        .then((res) => {
          console.log("Response :", res.data);
          setCourse(res.data);
          setCourseId(res.data._id);
          setLoading(false); // Turn off loading indicator
        })
        .catch((err) => {
          setCourseId(null);
          setLoading(false); // Turn off loading indicator on error
        });
    } else {
      setCourseId(null);
      setLoading(false); 
    }
  }, [reviewed]);

  const handleSubmitReview = () => {
    if (user){

      const data = {
        courseId: courseId,
        content: reviewText
      };
      addReview(data)
        .then((res) => {
          console.log("Review added successfully:", res);
          setReviewed(!reviewed)
          // toast.success("Review added successfully",{autoClose:3000});
          setReviewText(''); 
        })
        .catch((err) => {
          console.error("Failed to add review:", err);
          toast.error("Failed to add review");
        });
    }
    else{
      toast.warning("Please Login/Register First");
    }
  };

  const handleSubmitComment = () => {
    if (user) {
      const data = {
        courseId: courseId,
        content: commentText
      };
      console.log("Data is :", data);
      addComment(data)
        .then((res) => {
          console.log("Comment added successfully:", res);
          setReviewed(!reviewed);
          // toast.success("Comment added successfully", { autoClose: 3000 });
          setCommentText('');
        })
        .catch((err) => {
          console.error("Failed to add comment:", err);
          toast.error("Failed to add comment");
        });
    } else {
      toast.warning("Please Login/Register First");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
      backgroundImage: `url("https://static.vecteezy.com/system/resources/previews/006/852/804/original/abstract-blue-background-simple-design-for-your-website-free-vector.jpg")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      imageRendering: 'auto', // or 'crisp-edges' or 'pixelated' depending on the context
      minHeight: '100vh',
      }}>
        {loading ? (
          <div className="text-center pt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : courseId ? (
          <div className="container py-5">
            <div className="row">
              <div className="col-md-12 p-3 rounded" style={{ backgroundColor: 'white' }}>
                <h3 className='fw-bold'>
                  {course.courseName}
                </h3>
                <div className="d-flex justify-content-between">
                  <h6 className='text-gray' style={{ color: '#918d8d' }} >
                    {course.categoryName}
                  </h6>
                  <h6 className='text-gray' style={{ color: '#918d8d' }} >
                    {course.role === 'admin' ? 'ADMIN' : course.teacherInfo.fullName}
                  </h6>
                </div>
                <div className="embed-responsive embed-responsive-16by9 mb-3 my-3" style={{ height: '400px' }}>
                  <iframe
                    title="Course Video"
                    className="embed-responsive-item w-100 h-100"
                    src={course.titleVideo ? course.titleVideo : "https://www.youtube.com/embed/IAeGDqwXLXc"}
                    allowFullScreen
                  />
                </div>
                <strong>Description </strong>
                <p>
                  {course.description}
                </p>
                {
                  course.modules.map((module) => (
                    <ContentBanner key={module.id} data={module} setReviewed={setReviewed} />
                  ))
                }
                <div className="my-3">
                  <AllReviews reviews={course.reviews} />
                </div>
                <div className="reviewBox my-3">
                  <h6 className='fw-bold'>Write a Review</h6>
                  <textarea
                    className='form-control p-3'
                    name="reviewText"
                    rows={5}
                    placeholder='Write something about this Course'
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <button className='my-2 btn w-100' onClick={handleSubmitReview}>Submit Review</button>
                </div>
                <div className="reviewBox my-3">
                  <CommentList comments={course.comments} setReviewed={setReviewed} />
                  <h6 className='fw-bold'>Write a Comment</h6>
                  <textarea
                    className='form-control p-3'
                    name="commentText"
                    rows={5}
                    placeholder='Write something about this Course'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button className='my-2 btn w-100' onClick={handleSubmitComment}>Submit Comment</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h2 style={{ color: 'white' }}>No Course Found</h2>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Course;
