
const model = require("../models")
exports.addComments = async (req, res) => {
    try {
        const { courseId, content } = req.body;
        const userId = req.user._id
        const newComment = new model.comment({
            courseId,
            userId,
            content
        });

        const savedComment = await newComment.save();
        res.status(201).json({success:true,message:"comment submitted successfully"});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.addReplies =async (req, res) => {
    try {
        
        const { content,commentId } = req.body;
        const userId = req.user._id; // Assuming user ID is available in req.user

       

        // Find the comment by ID
        const comment = await model.comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Create a new reply
        const reply = {
            userId,
            content
        };

        // Add the reply to the comment's replies array
        comment.replies.push(reply);

        // Save the updated comment
        await comment.save();

        res.status(200).json({
            success: true,
            message: 'Reply added successfully',
            comment
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reply',
            error: error.message
        });
    }
}