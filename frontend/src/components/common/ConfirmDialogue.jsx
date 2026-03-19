/**
 * ConfirmDialog Component
 * FILE: src/components/common/ConfirmDialog.jsx
 *
 * NEW — Reusable delete/action confirmation modal.
 * Used by InstructorCourseCard, deleteSection, deleteSubSection, etc.
 * Prevents accidental deletions.
 */

import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title       = "Are you sure?",
  message     = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel  = "Cancel",
  loading      = false,
  variant      = "danger",
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-richblack-200 text-sm leading-relaxed">{message}</p>
  </Modal>
);

export default ConfirmDialog;