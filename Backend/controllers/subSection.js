const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

/* ================= CREATE SUBSECTION ================= */
exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const video = req.files?.video;

    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const newSubSection = await SubSection.create({
      title,
      description,
      timeDuration: `${uploadDetails.duration}`,
      videoUrl: uploadDetails.secure_url,
    });

    section.subSections.push(newSubSection._id);
    await section.save();

    const updatedSection = await Section.findById(sectionId).populate("subSections");

    return res.status(201).json({
      success: true,
      message: "SubSection created successfully",
      data: updatedSection,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subsection",
    });
  }
};

/* ================= UPDATE SUBSECTION ================= */
exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    const { title, description } = req.body;

    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) subSection.title = title;
    if (description !== undefined) subSection.description = description;

    if (req.files?.video) {
      const uploadDetails = await uploadImageToCloudinary(
        req.files.video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    const updatedSection = await Section.findOne({ subSections: subSectionId }).populate("subSections");

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSection,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update subsection",
    });
  }
};

/* ================= DELETE SUBSECTION ================= */
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    const updatedSection = await Section.findByIdAndUpdate(sectionId, {
      $pull: { subSections: subSectionId },
    }, { new: true }).populate("subSections");

    const deletedSubSection = await SubSection.findByIdAndDelete(
      subSectionId
    );

    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete subsection",
    });
  }
};
