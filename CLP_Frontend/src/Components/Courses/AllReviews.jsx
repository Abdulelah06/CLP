import React, { useState } from 'react';
import { Link } from 'react-router-dom';



const AllReviews = ({reviews}) => {
  const [visibleReviews, setVisibleReviews] = useState(3);

  const showMoreReviews = () => {
    setVisibleReviews(prevVisibleReviews => prevVisibleReviews + 3);
  };

  return (
    <div className="container mt-4">
      <h4>Reviews</h4>
      <div className="row">
        {reviews.slice(0, visibleReviews).map((review, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{review.reviewerName}</h5>
                <p className="card-text">{review.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleReviews < reviews.length && (
        <div className="text-center mt-3">
          <Link className="fw-bold " style={{color:'blue', textDecoration:'underline'}} onClick={showMoreReviews}>
            Show More
          </Link>
        </div>
      )}
    </div>
  );
}

export default AllReviews;
