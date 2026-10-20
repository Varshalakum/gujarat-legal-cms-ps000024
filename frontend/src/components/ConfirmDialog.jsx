import React from 'react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Yes, Proceed',
  cancelLabel = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        <header>
          <h3>{title}</h3>
        </header>
        <p>{message}</p>
        <footer>
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          {' '}
          <button type="button" onClick={onConfirm}>
            <strong>{confirmLabel}</strong>
          </button>
        </footer>
      </article>
    </dialog>
  );
};

export default ConfirmDialog;
