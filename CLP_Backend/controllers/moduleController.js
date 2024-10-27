const mongoose = require('mongoose');
const model = require("../models/index")
const cloudinary = require("../config/cloudinary");

exports.addFieldsToModule = async (req, res) => {
    const { fields } = req.body;
    const { moduleId } = req.body;

    try {
        // Find the module by moduleId
        const module = await model.modules.findById(moduleId);

        if (!module) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }

        // Add new fields to the module
        fields.forEach(field => {
            const newField = {
                name: field.name,
                content: field.content || "null"  // If content is not provided, default to empty string
            };
            module.fields.push(newField);
        });

        // Save the updated module with new fields
        await module.save();

        // Return success response
        return res.status(200).json({ success: true, message: "Fields added to module successfully", module });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};



exports.addVideosToFields =  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }
  
      const { moduleId, index } = req.body;
      const fileBuffer = req.file.buffer;
      const mimetype = req.file.mimetype;
      console.log(mimetype)
      let cloudinaryUrl;
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-matroska'];
      const allowedPdfTypes = ['application/pdf']; // Add more MIME types as needed
      // Upload file to Cloudinary based on file type
      if (allowedVideoTypes.includes(mimetype)) {
        const base64Video = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64Video, { resource_type: 'video' });
        cloudinaryUrl = result.secure_url;
      } else if (allowedPdfTypes.includes(mimetype)) {
        const base64Pdf = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64Pdf, { resource_type: 'auto' });
        cloudinaryUrl = result.secure_url;
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported file type' });
      }
  
      // Find the module by ID
      const module = await model.modules.findById(moduleId);
  
      if (!module) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }
  
      // If the module has less than 5 fields, add fields with name "null" and content ""
      if (module.fields.length < 5) {
        const fieldsToAdd = 5 - module.fields.length;
        for (let i = 0; i < fieldsToAdd; i++) {
          module.fields.push({ name: "null", content: "null" });
        }
        await module.save();
      }
  
      // Update the content of the field at the specified index with the Cloudinary URL
      if (index < 0 || index >= module.fields.length) {
        return res.status(400).json({ success: false, message: 'Invalid index provided' });
      }
  
      module.fields[index].content = cloudinaryUrl;
      await module.save();
  
      return res.status(200).json({ success: true, message: "File saved successfully", data: { updatedModule: module, moduleId } });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };


exports.updateFieldName = async (req, res) => {
    const { moduleId, index, name } = req.body;

    try {
        // Find the module by ID
        const module = await model.modules.findById(moduleId);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Check if the index is within the range of the fields array
        if (index < 0 || index >= module.fields.length) {
            return res.status(400).json({ success: false, message: 'Invalid index' });
        }

        // Update the name of the field at the specified index
        module.fields[index].name = name;

        // Save the updated module
        await module.save();

        return res.status(200).json({ success: true, message: "Field name updated successfully", data: module });
    } catch (error) {
        console.error('Error updating field name:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFieldInModule = async (req, res) => {
    const { moduleId, fieldId, newFieldData } = req.body;

    try {
        // Find the module by ID
        const module = await model.modules.findById(moduleId);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Find the field by ID
        const field = module.fields.id(fieldId);

        if (!field) {
            return res.status(404).json({ success: false, message: 'Field not found' });
        }

        // Update the field with the new data
        if (newFieldData.name !== undefined) {
            field.name = newFieldData.name;
        }
        if (newFieldData.content !== undefined) {
            field.content = newFieldData.content;
        }

        // Save the updated module
        await module.save();

        return res.status(200).json({ success: true, message: "Field updated successfully", data: module });
    } catch (error) {
        console.error('Error updating field:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addVideoAndTextField = async (req, res) => {
    try {
        const { moduleId, fields } = req.body;

        // Validate fields
        if (!Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Fields data is invalid or missing' });
        }

        // Find the module by ID
        const module = await model.modules.findById(moduleId);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Update the module's fields
        const updatedFields = fields.map((field, index) => ({
            name: field.name,
            content: field.content !== undefined ? field.content : (module.fields[index] ? module.fields[index].content : "")
        }));

        // Ensure the updated fields length matches the provided fields length
        module.fields = updatedFields.slice(0, fields.length);

        // Save the updated module
        await module.save();

        return res.status(200).json({ success: true, message: "Module fields updated successfully", data: { updatedModule: module } });
    } catch (error) {
        console.error('Error updating module fields:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



exports.deleteModule = async (req, res) => {
    const moduleId = req.params.id; // Get the module ID from the request parameters
    // if (req.user.role != "admin") {
    //     return res.status(401).json({ success: false, message: "Unauthorized" });
    // }
    let session;
    try {
        // Start a transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Find the module to delete
        const module = await model.modules.findById(moduleId).session(session);

        if (!module) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }

        // Delete the module
        await model.modules.findByIdAndDelete(moduleId).session(session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Module deleted successfully"
        });
    } catch (err) {
        // Rollback transaction if there's an error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.updateModuleName = async (req, res) => {
    const  moduleId  = req.params.id;
    const { moduleName } = req.body;
    const role = req.user.role;

    try {
        // Validate user role
        if (role !== "admin") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Find the module by its ID and update its name
        const module = await model.modules.findById(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }

        // Update module name
        module.moduleName = moduleName;
        await module.save();

        return res.status(200).json({
            success: true,
            message: "Module name updated successfully",
            data: module
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.getModuleById = async (req, res) => {
    const moduleId  = req.params.id

    try {
        // Find the module by its ID
        const module = await model.modules.findById(moduleId).populate('courseId', 'courseName description');
        if (!module) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Module retrieved successfully",
            data: module
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};