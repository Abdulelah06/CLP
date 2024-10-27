const model = require("../models/index")

exports.addCategory = async (req, res) => {
    const { name } = req.body;

    try {

        const newCategory = new model.category({
            name
        });

        await newCategory.save();

        return res.status(200).json({ success: true, message: "Category created successfully", data:{category: newCategory }});

    } catch (err) {

        console.error(err);

        return res.status(500).json({ success: false, message: "Server error", error: err.message });

    }

}

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await model.category.find().lean(); // Fetch all categories

        return res.status(200).json({ 
            success: true, 
            message: "Categories retrieved successfully", 
            data: { categories }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: err.message 
        });
    }
};


