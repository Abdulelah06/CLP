const mongoose = require("mongoose");
const model = require("../models/index");
require("dotenv").config()
function isCloudinaryVideoUrl(url) {
  return url.startsWith("https://res.cloudinary.com/");
}

exports.addCourse = async (req, res) => {
    const { courseId, courseName, category, description, modules } = req.body;
    const teacherId = req.user._id.toString();

    try {
        // Validate user role (assuming 'teacher' role is required)
        if (req.user.role === "student") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let course;
        if (courseId) {
            // Update existing course
            course = await model.courses.findById(courseId);

            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }

            // Update course fields without changing teacherId
            course.courseName = courseName;
            course.category = category;
            course.description = description;

            // Save updated course
            await course.save();
        } else {
            // Create new course
            course = new model.courses({
                courseName,
                category,
                description,
                teacherId
            });

            // Save new course
            await course.save();
        }

        // Create modules and fields
        const moduleDocs = [];
        for (const moduleName of modules) {
            const fields = []; // Initialize empty fields for each module

            // Create module document
            const newModule = new model.modules({
                moduleName,
                courseId: course._id,
                fields
            });

            // Save module document
            const savedModule = await newModule.save();
            moduleDocs.push({
                moduleId: savedModule._id,
                moduleName: savedModule.moduleName,
                fields: savedModule.fields // Include fields in the response
            });
        }

        // If updating, retrieve all modules associated with the course
        let allModules;
        if (courseId) {
            allModules = await model.modules.find({ courseId: courseId });
        } else {
            allModules = moduleDocs;
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: courseId ? "Course updated and modules created successfully" : "Course and modules created successfully",
            data: { course, modules: allModules }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

exports.getAllCourses = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 12; // Number of documents per page, default to 12 if not provided
    const search = req.query.search ? decodeURIComponent(req.query.search) : ''; // Search parameter, default to empty string if not provided
    const categoryId = req.query.category; // Category ID to filter courses
    try {
        const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive
        let query = { courseName: { $regex: searchRegex } };
        if (categoryId) {
            query.category = categoryId; // Add category filter if categoryId is provided
        }

        const count = await model.courses.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        const courses = await model.courses
            .find(query)
            .select("courseName description teacherId category status") // Select fields explicitly
            .populate("teacherId", "email") // Optionally populate teacherId with their email (example)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert documents to plain JavaScript objects

        // Map over courses to add category names and modules
        const coursesWithModules = await Promise.all(
            courses.map(async (course) => {
                // Find the category by ID
                const category = await model.category.findById(course.category);
                const categoryName = category ? category.name : null;

                // Find modules associated with the course
                const modules = await model.modules.find({ courseId: course._id }).lean();

                // Initialize titlevideo
                let titleVideo = null;

                // Process modules to add titlevideo if exists
                const modulesWithFields = modules.map(module => {
                    // Iterate through fields to find video URL
                    if (!titleVideo && module.fields && Array.isArray(module.fields)) {
                        for (const field of module.fields) {
                            if (field.content && field.content.includes('video')) {
                                titleVideo = field.content;
                                break; // Stop searching once a video URL is found
                            }
                        }
                    }

                    return module;
                });

                return {
                    ...course,
                    categoryName,
                    modules: modulesWithFields,
                    titleVideo // Add titlevideo to the course object
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "Courses retrieved successfully",
            data: {
                courses: coursesWithModules,
                totalPages,
                currentPage: page,
                total: count
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};
exports.getOneCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Find the course by ID
    const course = await model.courses
      .findById(courseId)
      .select("courseName description teacherId category status")
      .lean(); // Convert document to plain JavaScript object

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Find the category by ID
    const category = await model.category.findById(course.category);
    const reviews = await model.review.find({ courseId: course._id });
    if (reviews) {
      // Fetch reviewer names
      const reviewsWithNames = await Promise.all(
        reviews.map(async (review) => {
          // Fetch reviewer name based on userId
          let reviewerName = "admin";
          if (review.userId) {
            console.log("review", review.userId);
            const user = await model.student.findOne(
              { userId: review.userId.toString() },
              "fullName"
            );
            console.log("user in get", user);
            if (user) {
              console.log("user", user);
              reviewerName = user.fullName;
            } else {
              const teacher = await model.teacher.findOne(
                { userId: review.userId.toString() },
                "fullName"
              );
              if (teacher) {
                console.log("teacher", teacher);
                reviewerName = teacher.fullName;
              }
            }
          }
          return {
            content: review.content,
            userId: review.userId, // Assuming you want to keep userId for reference
            reviewerName: reviewerName, // Assign the fetched reviewer name
          };
        })
      );

      course.reviews = reviewsWithNames;
    }
    // Add the category name to the course object
    course.categoryName = category ? category.name : null;
    const user = await model.user.findById(course.teacherId);
    course.role = user.role;
    // Find the modules related to the course
    const modules = await model.modules
      .find({ courseId: course._id })
      .select("moduleName fields")
      .lean();

    // Initialize titlevideo as null
    let titleVideo = null;

    // Go through fields to find the first video URL
    for (const module of modules) {
      for (const field of module.fields) {
        if (
          field.content &&
          (field.content.startsWith(`https://res.cloudinary.com/${process.env.cloud_name}/video/`) ||
            field.content.startsWith(`https://res.cloudinary.com/${process.env.cloud_name}/video/`))
        ) {
          titleVideo = field.content;
          break;
        }
      }
      if (titleVideo) break;
    }

    // Add titlevideo to the course object
    if (titleVideo) {
      course.titleVideo = titleVideo;
    }

    // Find teacher info by userId
    const teacherInfo = await model.teacher
      .findOne({ userId: course.teacherId })
      .lean();

    if (teacherInfo) {
      course.teacherInfo = teacherInfo;
    }

    // Add the modules to the course object
    course.modules = modules;

    // Find comments related to the course
    const comments = await model.comment.find({ courseId: course._id }).lean();

    // Fetch commenter and replier names
    const getUserName = async (userId) => {
      let user = await model.teacher.findOne({ userId }, "fullName");
      if (user) return user.fullName;
      user = await model.student.findOne({ userId }, "fullName");
      if (user) return user.fullName;
      return "admin";
    };

    // Process comments and replies
    const commentsWithNames = await Promise.all(
      comments.map(async (comment) => {
        const commenterName = await getUserName(comment.userId);
        const repliesWithNames = await Promise.all(
          comment.replies.map(async (reply) => {
            const replierName = await getUserName(reply.userId);
            return {
              ...reply,
              replierName,
            };
          })
        );
        return {
          ...comment,
          commenterName,
          replies: repliesWithNames,
        };
      })
    );

    course.comments = commentsWithNames;

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getUpdate = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Find the course by courseId
    const course = await model.courses
      .findById(courseId)
      .select("courseName description teacherId category status");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Find the category by ID (without using populate)
    const category = await model.category.findById(course.category);
    const categoryName = category ? category.name : null;
    const categoryId = category._id.toString()
    // Find all modules related to the course
    const modules = await model.modules
      .find({ courseId })
      .select("moduleName fields");

    // Construct the response object
    const courseData = {
      _id: course._id,
      courseName: course.courseName,
      description: course.description,
      teacherId: course.teacherId,
      categoryName,
      categoryId,
      status: course.status,
      modules: modules.map((module) => ({
        _id: module._id,
        moduleName: module.moduleName,
        fields: module.fields, // Assuming 'fields' is directly embedded within 'module'
      })),
    };

    return res
      .status(200)
      .json({
        success: true,
        message: "Course data retrieved successfully",
        data: courseData,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
    const courseId = req.params.id;
    const { courseName, description, modules } = req.body;
  
    try {
      // Find the course first
      let course = await model.courses.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
  
      // Update course details if provided in the request body
      if (courseName) {
        course.courseName = courseName;
      }
      if (description) {
        course.description = description;
      }
      await course.save();
  
      // Update or add modules
      const updatedModules = await Promise.all(
        modules.map(async (module) => {
          if (module._id) {
            // If module has _id, find and update existing module
            let existingModule = await model.modules.findOne({ _id: module._id });
            if (!existingModule) {
              return {
                success: false,
                message: "Module not found",
              };
            }
  
            existingModule.moduleName = module.moduleName;
  
            // Update or add fields within the module
            module.fields.forEach(field => {
              if (field._id) {
                // Find and update existing field
                let existingField = existingModule.fields.id(field._id);
                if (existingField) {
                  existingField.name = field.name;
                  existingField.content = field.content;
                }
              } else {
                // Add new field
                existingModule.fields.push(field);
              }
            });
  
            await existingModule.save();
            return existingModule;
          } else {
            // If module doesn't have _id, create a new module
            const newModule = new model.modules({
              moduleName: module.moduleName,
              courseId: courseId,
              fields: module.fields || [],
            });
            const savedModule = await newModule.save();
            return savedModule;
          }
        })
      );
    
      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
  };

  exports.getAllCoursesSearch = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const limit = parseInt(req.query.limit) || 12; // Number of documents per page, default to 12 if not provided
    const search = req.query.search || ''; // Search parameter, default to empty string if not provided
    const category = req.category.category || null
    try {
      const query = { courseName: { $regex: searchRegex } }
      if(category){
        query.category = category
      }
      // Create a regex to search for course names containing the search value
      const searchRegex = new RegExp(search, 'i'); // 'i' for case-insensitive
  
      // Find courses with pagination and search
      const count = await model.courses.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
  
      const courses = await model.courses
        .find(query)
        .select("courseName description teacherId category status") // Select fields explicitly
        .populate("teacherId", "email") // Optionally populate teacherId with their email (example)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // Convert documents to plain JavaScript objects
  
      // Map over courses to add category names and titlevideo if found
      const coursesWithCategory = await Promise.all(
        courses.map(async (course) => {
          // Find the category by ID
          const category = await model.category.findById(course.category);
          const categoryName = category ? category.name : null;
  
          // Check if modules exist and are iterable
          if (!course.modules || !Array.isArray(course.modules)) {
            return {
              ...course,
              categoryName,
              modules: [],
            };
          }
  
          // Iterate through modules to find titlevideo
          const modulesWithFields = await Promise.all(
            course.modules.map(async (module) => {
              // Check if fields exist and are iterable
              if (!module.fields || !Array.isArray(module.fields)) {
                return {
                  ...module,
                  fields: [],
                  titlevideo: null,
                };
              }
  
              // Initialize titlevideo
              let titlevideo = null;
  
              // Iterate through fields to find Cloudinary video URL
              for (const field of module.fields) {
                if (field.content && isCloudinaryVideoUrl(field.content)) {
                  titlevideo = field.content;
                  break; // Stop searching once a video URL is found
                }
              }
  
              return {
                ...module,
                fields: module.fields, // Ensure fields are included
                titlevideo,
              };
            })
          );
  
          return {
            ...course,
            categoryName,
            modules: modulesWithFields,
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        message: "Courses retrieved successfully",
        data: {
          courses: coursesWithCategory,
          totalPages,
          currentPage: page,
          total: count,
        },
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  };

  exports.deleteCourse = async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user._id.toString();

    try {
        // Validate user role
        if (req.user.role === "student") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Start a transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        const course = await model.courses.findById(courseId).session(session);
        if (!course) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Check if the logged-in user is the teacher who created the course or an admin
        if (course.teacherId.toString() !== userId && req.user.role !== 'admin') {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        // Delete the modules associated with the course
        await model.modules.deleteMany({ courseId: course._id }).session(session);

        // Delete the course
        await model.courses.findByIdAndDelete(courseId).session(session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Course and associated modules deleted successfully" });
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