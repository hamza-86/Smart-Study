import React, { useEffect, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { updateSection } from "../../slices/courseSlice";
import {
  addSubsection,
  editSubsection,
} from "../../services/courseAPI";

const CreateSubsectionModal = ({
  isModalOpen,
  closeModal,
  sectionId,
  existingSubsection,
}) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);

  useEffect(() => {
    if (existingSubsection) {
      setTitle(existingSubsection.title || "");
      setDescription(existingSubsection.description || "");
    }
  }, [existingSubsection]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("sectionId", sectionId);

    if (video) {
      formData.append("video", video);
    }

    let response;

    if (existingSubsection) {
      response = await editSubsection(
        existingSubsection._id,
        formData,
        token
      );
    } else {
      response = await addSubsection(formData, token);
    }

    if (response?.success && response?.data) {
      dispatch(updateSection(response.data));
      closeModal();
      setTitle("");
      setDescription("");
      setVideo(null);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-6 rounded-xl text-white bg-richblack-800 w-[90%] max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {existingSubsection ? "Edit Lecture" : "Add Lecture"}
        </h2>

        <form onSubmit={submitHandler} className="flex flex-col gap-5">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="text-sm"
          />

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lecture Title"
            className="bg-richblack-700 p-2 rounded"
          />

          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Lecture Description"
            className="bg-richblack-700 p-2 rounded"
          />

          <button
            type="submit"
            className="bg-yellow-50 text-black py-2 rounded flex items-center justify-center gap-2"
          >
            <MdOutlineCloudUpload />
            {existingSubsection ? "Update Lecture" : "Upload Lecture"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSubsectionModal;
