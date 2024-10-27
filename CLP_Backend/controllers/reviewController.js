const model = require("../models/index")

exports.addReview = async (req, res) => {
    const { courseId, content } = req.body;
    const userId = req.user._id.toString();
    try {
        // Check if the courseId is valid
        const existingCourse = await model.courses.findById(courseId);
        if (!existingCourse) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Create a new review
        const newReview = new model.review({
            courseId,
            userId,
            content
        });

        // Save the review to the database
        await newReview.save();

        return res.status(201).json({ success: true, message: 'Review added successfully', data: { review: newReview } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};