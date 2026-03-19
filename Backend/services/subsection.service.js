/**
 * SubSection (Video/Lecture) Service
 * Handles all subsection-related business logic
 */

const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── createSubSection ────────────────────────────────────────────────────────

const createSubSection = async (
  sectionId,
  courseId,
  instructorId,
  subSectionData,
  videoFile,
  notesFiles = []  // array of file objects
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, order, isPreview } = subSectionData;

    if (!title?.trim() || !description?.trim()) {
      throw APIError.validation("Title and description are required");
    }
    if (!videoFile) {
      throw APIError.validation("Video file is required");
    }
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw APIError.validation("Invalid section ID");
    }

    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      throw APIError.notFound("Section");
    }

    // Verify course ownership
    const course = await Course.findOne({
      _id:          courseId,
      courseContent: sectionId,
      instructor:    instructorId,
    }).session(session);

    if (!course) {
      throw APIError.authorization(
        "Not authorized to add videos to this section"
      );
    }

    // Upload video to Cloudinary
    const uploadedVideo = await uploadImageToCloudinary(
      videoFile,
      `${process.env.FOLDER_NAME || "EduFlow"}/videos`
    );

    // Upload note attachments (PDFs, docs, etc.)
    const attachments = [];
    for (const noteFile of notesFiles) {
      const uploaded = await uploadImageToCloudinary(
        noteFile,
        `${process.env.FOLDER_NAME || "EduFlow"}/attachments`
      );
      attachments.push({
        name: noteFile.name || uploaded.original_filename,
        url:  uploaded.secure_url,
        type: (noteFile.name || "").split(".").pop().toLowerCase() || "other",
      });
    }

    const subsection = await SubSection.create(
      [{
        title:       title.trim(),
        description: description.trim(),
        videoUrl:    uploadedVideo.secure_url,
        videoPublicId: uploadedVideo.public_id,
        timeDuration: Math.round(uploadedVideo.duration || 0), // seconds
        order:        order ?? section.subSections.length,
        isPreview:    isPreview === "true" || isPreview === true,
        attachments,
      }],
      { session }
    );

    // Add to section
    await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSections: subsection[0]._id } },
      { session }
    );

    // Update course totals
    await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          totalLectures: 1,
          totalDuration: Math.round(uploadedVideo.duration || 0) / 60, // minutes
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("SubSection created", {
      sectionId,
      subSectionId: subsection[0]._id,
    });

    return {
      success:    true,
      message:    "Lecture uploaded successfully",
      subsection: subsection[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Create subsection error", error);
    throw error;
  }
};

// ─── updateSubSection ────────────────────────────────────────────────────────

const updateSubSection = async (
  subSectionId,
  instructorId,
  updateData,
  videoFile  = null,
  notesFiles = null  // null = don't touch; [] = replace all; [files] = add
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      throw APIError.validation("Invalid subsection ID");
    }

    const subsection = await SubSection.findById(subSectionId).session(session);
    if (!subsection) {
      throw APIError.notFound("SubSection");
    }

    // Verify ownership via section → course
    const section = await Section.findOne({
      subSections: subSectionId,
    }).session(session);
    if (!section) {
      throw APIError.notFound("Section for this subsection");
    }

    const course = await Course.findOne({
      courseContent: section._id,
      instructor:    instructorId,
    }).session(session);
    if (!course) {
      throw APIError.authorization("Not authorized to update this lecture");
    }

    // Update scalar fields
    if (updateData.title       !== undefined) subsection.title       = updateData.title.trim();
    if (updateData.description !== undefined) subsection.description = updateData.description.trim();
    if (updateData.order       !== undefined) subsection.order       = updateData.order;
    if (updateData.isPreview   !== undefined) {
      subsection.isPreview = updateData.isPreview === "true" || updateData.isPreview === true;
    }

    // Replace video
    if (videoFile) {
      const oldDuration = subsection.timeDuration || 0;

      // Delete old video from Cloudinary
      if (subsection.videoPublicId) {
        try {
          const cloudinary = require("cloudinary").v2;
          await cloudinary.uploader.destroy(subsection.videoPublicId, {
            resource_type: "video",
          });
        } catch (err) {
          logger.warn("Could not delete old video from Cloudinary", {
            publicId: subsection.videoPublicId,
          });
        }
      }

      const uploaded = await uploadImageToCloudinary(
        videoFile,
        `${process.env.FOLDER_NAME || "EduFlow"}/videos`
      );

      subsection.videoUrl      = uploaded.secure_url;
      subsection.videoPublicId = uploaded.public_id;
      subsection.timeDuration  = Math.round(uploaded.duration || 0);

      // Update course duration delta
      const delta = subsection.timeDuration - oldDuration;
      await Course.findByIdAndUpdate(
        course._id,
        { $inc: { totalDuration: delta / 60 } },
        { session }
      );
    }

    // Replace/add note attachments
    if (notesFiles !== null) {
      const newAttachments = [];
      for (const noteFile of notesFiles) {
        const uploaded = await uploadImageToCloudinary(
          noteFile,
          `${process.env.FOLDER_NAME || "EduFlow"}/attachments`
        );
        newAttachments.push({
          name: noteFile.name || uploaded.original_filename,
          url:  uploaded.secure_url,
          type: (noteFile.name || "").split(".").pop().toLowerCase() || "other",
        });
      }
      subsection.attachments = newAttachments;
    }

    await subsection.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info("SubSection updated", { subSectionId });

    return {
      success:    true,
      message:    "Lecture updated successfully",
      subsection,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Update subsection error", error);
    throw error;
  }
};

// ─── deleteSubSection ────────────────────────────────────────────────────────

const deleteSubSection = async (
  subSectionId,
  sectionId,
  courseId,
  instructorId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      throw APIError.validation("Invalid subsection ID");
    }

    const course = await Course.findOne({
      _id:       courseId,
      instructor: instructorId,
    }).session(session);
    if (!course) {
      throw APIError.authorization("Not authorized to delete this lecture");
    }

    const subsection = await SubSection.findById(subSectionId).session(session);
    if (!subsection) {
      throw APIError.notFound("SubSection");
    }

    // Delete video from Cloudinary
    if (subsection.videoPublicId) {
      try {
        const cloudinary = require("cloudinary").v2;
        await cloudinary.uploader.destroy(subsection.videoPublicId, {
          resource_type: "video",
        });
      } catch (err) {
        logger.warn("Could not delete video from Cloudinary", {
          publicId: subsection.videoPublicId,
        });
      }
    }

    // Remove from section
    await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSections: subSectionId } },
      { session }
    );

    // Update course totals
    await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          totalLectures: -1,
          totalDuration: -(subsection.timeDuration || 0) / 60,
        },
      },
      { session }
    );

    await SubSection.findByIdAndDelete(subSectionId, { session });

    await session.commitTransaction();
    session.endSession();

    logger.info("SubSection deleted", { subSectionId });

    return { success: true, message: "Lecture deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete subsection error", error);
    throw error;
  }
};

module.exports = {
  createSubSection,
  updateSubSection,
  deleteSubSection,
};