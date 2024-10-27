import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAPI } from '../../Contexts/APIContext';

const Comment = ({ comment, setReviewed }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const { addReply } = useAPI();
  const user = localStorage.getItem("user");

  const handleReplySubmit = () => {
    if (user) {
      setLoading(true);
      const data = {
        commentId: comment._id,
        content: replyText
      };
      console.log("Reply is :", data);
      addReply(data)
        .then((res) => {
          console.log("Reply added successfully:", res);
          setReplyText('');
          setReviewed(prev => !prev);
        })
        .catch((err) => {
          console.error("Failed to add reply:", err);
          toast.error("Failed to add reply");
        })
        .finally(() => {
            setTimeout(() => { 
                setLoading(false);
            }, 1000);
        });
    } else {
      toast.warning("Please Login/Register First");
    }
  };

  return (
    <div className="comment-box my-3 p-3" style={{ backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
      <h6 className='fw-bold'>{comment.commenterName}</h6>
      <p>{comment.content}</p>
      <div className="replies">
        {comment.replies.map((reply) => (
          <div key={reply._id} className="reply-box my-2 p-2" style={{ backgroundColor: '#e9e9e9', borderRadius: '5px' }}>
            <h6 className='fw-bold'>{reply.replierName}</h6>
            <p>{reply.content}</p>
          </div>
        ))}
      </div>
      <div className="reply-form my-3">
        <textarea
          className='form-control p-2'
          name="replyText"
          rows={2}
          placeholder='Write a reply...'
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button 
          className='my-2 btn btn-primary' 
          onClick={handleReplySubmit} 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </div>
  );
};

export default Comment;
