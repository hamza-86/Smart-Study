import axios from "axios";
import { endpoints } from "./api";
import toast from "react-hot-toast";
import { setLoading } from "../slices/authSlice";

const {
  GET_ALL_CATEGORIES,
  CREATE_COURSE_API,
  ADD_SECTION_API,
  DELETE_SECTION_API,
  CREATE_SUBSECTION_API,
  GET_INSTRUCTOR_COURSES,
  DELETE_COURSE_API,
  DELETE_SUBSECTION_API,
  UPDATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  GET_ENROLLED_COURSES,
  GET_COURSE_DETAILS,
} = endpoints;

/* =====================================================
   COURSE
===================================================== */

// Create Course
export const createCourse = async (token, formData) => {
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.post(CREATE_COURSE_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    toast.success("Course Created Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create course");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Fetch Instructor Courses
export const fetchInstructorCourses = async (token, dispatch) => {
  dispatch(setLoading(true));
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.get(GET_INSTRUCTOR_COURSES, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Fetch Courses");
    return null;
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Fetch Enrolled Courses
export const getEnrolledCourses = async (token, dispatch) => {
  dispatch(setLoading(true));
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.get(GET_ENROLLED_COURSES, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Fetch Courses");
    return null;
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Get Full Course Details (PARAM BASED)
export const fetchCourseDetails = async (courseId, token, dispatch) => {
  dispatch(setLoading(true));
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.get(GET_COURSE_DETAILS(courseId), {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Fetch Course");
    return null;
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Delete Course (PARAM BASED)
export const deleteCourse = async (courseId, token) => {
  const toastId = toast.loading("Deleting...");
  try {
    const response = await axios.delete(
      DELETE_COURSE_API(courseId),
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    toast.success("Course Deleted Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Delete Course");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

/* =====================================================
   CATEGORY
===================================================== */

export const fetchCategories = async () => {
  try {
    const response = await axios.get(GET_ALL_CATEGORIES);
    return response.data.data;
  } catch (error) {
    console.log("Category Fetch Error:", error);
    return [];
  }
};

/* =====================================================
   SECTION
===================================================== */

export const createSection = async (sectionName, courseId, token) => {
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.post(
      ADD_SECTION_API,
      { sectionName, courseId },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    toast.success("Section Added Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete Section
export const deleteSection = async (sectionId, courseId, token) => {
  const toastId = toast.loading("Deleting...");
  try {
    const response = await axios.delete(
      DELETE_SECTION_API,
      {
        data: { sectionId, courseId },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    toast.success("Section Deleted Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update Section (PARAM BASED)
export const editSection = async (sectionName, sectionId, token) => {
  const toastId = toast.loading("Updating...");
  try {
    const response = await axios.put(
      UPDATE_SECTION_API(sectionId),
      { sectionName },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    toast.success("Section Updated Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

/* =====================================================
   SUBSECTION
===================================================== */

export const addSubsection = async (formData, token) => {
  const toastId = toast.loading("Uploading...");
  try {
    const response = await axios.post(CREATE_SUBSECTION_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    toast.success("Lecture Added Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Update Subsection (PARAM BASED)
export const editSubsection = async (subSectionId, formData, token) => {
  const toastId = toast.loading("Updating...");
  try {
    const response = await axios.put(
      UPDATE_SUBSECTION_API(subSectionId),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    toast.success("Lecture Updated Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete Subsection
export const deleteSubsection = async (subSectionId, sectionId, token) => {
  const toastId = toast.loading("Deleting...");
  try {
    const response = await axios.delete(
      DELETE_SUBSECTION_API,
      {
        data: { subSectionId, sectionId },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    toast.success("Lecture Deleted Successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};



// Compatibility function (DO NOT REMOVE - used in CourseContent page)
export const fetchEnrolledCourse = async (courseId, token, dispatch) => {
  dispatch(setLoading(true));
  const toastId = toast.loading("Loading...");
  try {
    const response = await axios.get(
      GET_COURSE_DETAILS(courseId),
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    return {
      status: 200,
      data: {
        data: {
          courseDetails: response.data.data.course,
        },
      },
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Could Not Fetch Course");
    return null;
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};