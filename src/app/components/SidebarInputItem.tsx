import React, { useRef, useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoIosSave } from "react-icons/io";

export default function SidebarInputItem({
  icon,
  text,
  isEditEnabled,
  isDeleteEnabled,
  onChange,
  onDelete,
  onClick
}: {
  icon: any,
  text: string,
  isEditEnabled: boolean
  isDeleteEnabled: boolean
  onChange?: (oldValue: string, newValue: string) => any
  onDelete?: (value: string) => any
  onClick?: () => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    if (!onChange) {
      return; // If no onChange function is provided return
    }

    setIsEditing(!isEditing);

    if (isEditing) {
      const error = onChange?.(text, inputValue);
      if (error) {
        setInputValue(text); // Reset to original text on error
      }
    }
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(inputValue);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const ref = inputRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isEditing) {
        handleEditClick();
      }
    };
    ref?.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      ref?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, inputValue]);

  return (
    <div
      className="flex justify-between space-x-4 hover:bg-gray-600 duration-300 rounded-xl p-2 cursor-pointer"
    >
      <div className="flex flex-grow items-center" onClick={onClick}>
        <div className="flex text-xl">
          {icon}
        </div>
        <input
          ref={inputRef}
          className={`ml-2 w-full outline-none bg-transparent text-base text-gray-200 placeholder-gray-500
            ${isEditing ? 'cursor-text' : 'cursor-pointer'}`}
          type="text"
          value={inputValue}
          placeholder="Add New Item Here"
          onChange={(e) => setInputValue(e.target.value)}
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-start space-x-2">
        {isEditEnabled &&
          <button title="Edit" onClick={handleEditClick}>
            {isEditing ?
              <IoIosSave className="hover:text-green-500 text-xl" />
              :
              <MdEdit className="hover:text-blue-400 text-xl" />
            }
          </button>
        }
        {isDeleteEnabled &&
          <button title="Delete" className="hover:text-red-400" onClick={handleDeleteClick}>
            <MdDelete className="text-xl" />
          </button>
        }
      </div>
    </div>
  );
}
