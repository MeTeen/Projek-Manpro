/* src/components/common/EditModal.tsx */
import React, { ReactNode, FormEvent } from 'react';

export interface EditModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  width?: string;
  minHeight?: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  width = '500px',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div 
        className="bg-white rounded-lg p-6 max-w-[90%] max-h-[90vh] overflow-y-auto"
        style={{ width }}
      >
        <h2 className="mt-0 text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 border-0 rounded cursor-pointer text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 text-white border-0 rounded cursor-pointer text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};