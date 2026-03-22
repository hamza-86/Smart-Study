/**
 * SubSection Service
 * Supports video/image/note/quiz subsection types.
 */

const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

const resolveContent = async (type, mediaFile, notesFiles = [], data = {}) => {
  const rawType = String(type || "video").toLowerCase();
  const normalizedType = rawType === "note" ? "notes" : rawType;
  const result = {
    type: normalizedType,
    videoUrl: null,
    videoPublicId: null,
    timeDuration: 0,
    contentUrl: null,
    textContent: data.textContent?.trim?.() || "",
    attachments: [],
  };

  if (normalizedType === "video" && mediaFile) {
    const uploaded = await uploadImageToCloudinary(
      mediaFile,
      `${process.env.FOLDER_NAME || "EduFlow"}/videos`
    );
    result.videoUrl = uploaded.secure_url;
    result.videoPublicId = uploaded.public_id;
    result.timeDuration = Math.round(uploaded.duration || 0);
  }

  if (normalizedType === "image" && mediaFile) {
    const uploaded = await uploadImageToCloudinary(
      mediaFile,
      `${process.env.FOLDER_NAME || "EduFlow"}/images`
    );
    result.contentUrl = uploaded.secure_url;
  }

  if (normalizedType === "notes") {
    if (mediaFile) {
      const uploaded = await uploadImageToCloudinary(
        mediaFile,
        `${process.env.FOLDER_NAME || "EduFlow"}/notes`
      );
      result.contentUrl = uploaded.secure_url;
    }
    for (const file of notesFiles) {
      const uploaded = await uploadImageToCloudinary(
        file,
        `${process.env.FOLDER_NAME || "EduFlow"}/attachments`
      );
      result.attachments.push({
        name: file.name || uploaded.original_filename,
        url: uploaded.secure_url,
        type: (file.name || "").split(".").pop()?.toLowerCase() || "other",
      });
    }
  }

  return result;
};

const createSubSection = async (
  sectionId,
  courseId,
  instructorId,
  subSectionData,
  mediaFile,
  notesFiles = []
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, order, isPreview, type = "video" } = subSectionData;

    if (!title?.trim() || !description?.trim()) {
      throw APIError.validation("Title and description are required");
    }
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw APIError.validation("Invalid section ID");
    }

    const section = await Section.findById(sectionId).session(session);
    if (!section) throw APIError.notFound("Section");

    const course = await Course.findOne({
      _id: courseId,
      courseContent: sectionId,
      instructor: instructorId,
    }).session(session);
    if (!course) throw APIError.authorization("Not authorized");

    const content = await resolveContent(type, mediaFile, notesFiles, subSectionData);

    const subsection = await SubSection.create(
      [
        {
          type: content.type,
          title: title.trim(),
          description: description.trim(),
          videoUrl: content.videoUrl,
          videoPublicId: content.videoPublicId,
          timeDuration: content.timeDuration,
          contentUrl: content.contentUrl,
          textContent: content.textContent,
          order: order ?? section.subSections.length,
          isPreview: isPreview === "true" || isPreview === true,
          attachments: content.attachments,
        },
      ],
      { session }
    );

    await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSections: subsection[0]._id } },
      { session }
    );

    await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          totalLectures: 1,
          totalDuration: Math.round(content.timeDuration || 0) / 60,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Subsection created successfully", subsection: subsection[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Create subsection error", error);
    throw error;
  }
};

const updateSubSection = async (
  subSectionId,
  instructorId,
  updateData,
  mediaFile = null,
  notesFiles = null
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      throw APIError.validation("Invalid subsection ID");
    }

    const subsection = await SubSection.findById(subSectionId).session(session);
    if (!subsection) throw APIError.notFound("SubSection");

    const section = await Section.findOne({ subSections: subSectionId }).session(session);
    if (!section) throw APIError.notFound("Section");

    const course = await Course.findOne({
      courseContent: section._id,
      instructor: instructorId,
    }).session(session);
    if (!course) throw APIError.authorization("Not authorized");

    const prevDuration = subsection.timeDuration || 0;
    const prevType = subsection.type || "video";

    if (updateData.title !== undefined) subsection.title = updateData.title.trim();
    if (updateData.description !== undefined) subsection.description = updateData.description.trim();
    if (updateData.order !== undefined) subsection.order = updateData.order;
    if (updateData.isPreview !== undefined) {
      subsection.isPreview = updateData.isPreview === "true" || updateData.isPreview === true;
    }
    if (updateData.type !== undefined) {
      const nextType = String(updateData.type).toLowerCase();
      subsection.type = nextType === "note" ? "notes" : nextType;
    }
    if (updateData.textContent !== undefined) subsection.textContent = updateData.textContent;

    const needsContentUpdate = !!mediaFile || subsection.type !== prevType || notesFiles !== null;
    if (needsContentUpdate) {
      const content = await resolveContent(
        subsection.type,
        mediaFile,
        notesFiles || [],
        updateData
      );
      if (content.videoUrl !== null) subsection.videoUrl = content.videoUrl;
      if (content.videoPublicId !== null) subsection.videoPublicId = content.videoPublicId;
      subsection.timeDuration = content.timeDuration || 0;
      if (content.contentUrl !== null) subsection.contentUrl = content.contentUrl;
      subsection.textContent = content.textContent || subsection.textContent;
      if (subsection.type === "notes" && notesFiles !== null) {
        subsection.attachments = content.attachments;
      }
    }

    const delta = (subsection.timeDuration || 0) - prevDuration;
    if (delta !== 0) {
      await Course.findByIdAndUpdate(course._id, { $inc: { totalDuration: delta / 60 } }, { session });
    }

    await subsection.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Subsection updated successfully", subsection };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Update subsection error", error);
    throw error;
  }
};

const deleteSubSection = async (subSectionId, sectionId, courseId, instructorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
      throw APIError.validation("Invalid subsection ID");
    }
    const course = await Course.findOne({ _id: courseId, instructor: instructorId }).session(session);
    if (!course) throw APIError.authorization("Not authorized");

    const subsection = await SubSection.findById(subSectionId).session(session);
    if (!subsection) throw APIError.notFound("SubSection");

    await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSections: subSectionId } },
      { session }
    );

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
    return { success: true, message: "Subsection deleted successfully" };
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
