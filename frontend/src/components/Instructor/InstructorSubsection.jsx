import React, { useState } from "react";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteSubsection } from "../../services/courseAPI";
import { useDispatch } from "react-redux";
import { updateSection } from "../../slices/courseSlice";
import CreateSubsectionModal from "./CreateSubsectionModal";

const InstructorSubsection = ({
  subSection,
  sectionId,
  token,
}) => {
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);

  const deleteHandler = async () => {
    const response = await deleteSubsection(
      subSection._id,
      sectionId,
      token
    );

    if (response?.success && response?.data) {
      dispatch(updateSection(response.data));
    }
  };

  return (
    <>
      <div className="flex justify-between px-10 py-2">
        <div className="flex items-center gap-3">
          <HiOutlineVideoCamera />
          <p>{subSection.title}</p>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setModalOpen(true)}>
            <FiEdit2 />
          </button>

          <button onClick={deleteHandler}>
            <RiDeleteBin6Line />
          </button>
        </div>
      </div>

      <CreateSubsectionModal
        isModalOpen={isModalOpen}
        closeModal={() => setModalOpen(false)}
        sectionId={sectionId}
        existingSubsection={subSection}
      />
    </>
  );
};

export default InstructorSubsection;
