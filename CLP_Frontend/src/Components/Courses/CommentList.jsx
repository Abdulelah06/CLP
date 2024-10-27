import React from 'react';
import Comment from './Comment';

const CommentList = ({ comments,setReviewed }) => {
  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} setReviewed={setReviewed} />
      ))}
    </div>
  );
};

export default CommentList;
