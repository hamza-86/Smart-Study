/**
 * Course Slice
 * FILE: src/slices/courseSlice.js
 *
 * Changes from original:
 *  - Added addSubSection, updateSubSection, removeSubSection reducers
 *    (needed by InstructorSection component when adding/editing lectures)
 *  - setCourse now merges rather than fully replaces (existing behaviour kept)
 *  - resetCourseState uses standard return syntax for RTK compatibility
 */

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  course:   null,
  sections: [],
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {

    // Set or merge course details
    setCourse(state, action) {
      state.course = { ...(state.course || {}), ...(action.payload || {}) };
    },

    // Replace entire sections array
    setSections(state, action) {
      state.sections = action.payload || [];
    },

    // Update one section (by _id) or replace all if array given
    updateSection(state, action) {
      const payload = action.payload;
      if (!payload) return;

      if (Array.isArray(payload)) {
        state.sections = payload;
        return;
      }

      const index = state.sections.findIndex((s) => s._id === payload._id);
      if (index !== -1) {
        state.sections[index] = payload;
      }
    },

    // Remove a section by _id
    removeSection(state, action) {
      state.sections = state.sections.filter((s) => s._id !== action.payload);
    },

    // Add a subsection to a specific section
    addSubSection(state, action) {
      const { sectionId, subSection } = action.payload;
      const section = state.sections.find((s) => s._id === sectionId);
      if (section) {
        section.subSections = [...(section.subSections || []), subSection];
      }
    },

    // Update a subsection within a section
    updateSubSection(state, action) {
      const { sectionId, subSection } = action.payload;
      const section = state.sections.find((s) => s._id === sectionId);
      if (section) {
        const idx = section.subSections?.findIndex(
          (sub) => sub._id === subSection._id
        );
        if (idx !== -1 && idx !== undefined) {
          section.subSections[idx] = subSection;
        }
      }
    },

    // Remove a subsection from a section
    removeSubSection(state, action) {
      const { sectionId, subSectionId } = action.payload;
      const section = state.sections.find((s) => s._id === sectionId);
      if (section) {
        section.subSections = section.subSections?.filter(
          (sub) => sub._id !== subSectionId
        );
      }
    },

    // Full reset after course creation flow completes
    resetCourseState() {
      return { course: null, sections: [] };
    },
  },
});

export const {
  setCourse,
  setSections,
  updateSection,
  removeSection,
  addSubSection,
  updateSubSection,
  removeSubSection,
  resetCourseState,
} = courseSlice.actions;

export default courseSlice.reducer;