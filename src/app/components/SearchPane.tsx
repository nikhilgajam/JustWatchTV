import React from "react";
import { useContextData } from "../context/Context";
import { IoIosSearch } from "react-icons/io";

export default function SearchPane() {
  const {
    searchSuggestions,
    setTriggerSearch,
    setSearchSuggestions,
    setSearchQuery,
  } = useContextData();

  const handleClick = (query: string) => {
    setSearchSuggestions([]); // Clear suggestions after selection
    if (query) {
      setSearchQuery(convertToPlainText(query)); // Set the plain text search query to the context
      setTriggerSearch(true); // Trigger the search
    }
  };

  const convertToPlainText = (text: string): string => {
    return JSON.parse(`"${text}"`);
  };

  return (
    <div
      className="fixed mt-12 top-0 p-4 pb-12 bg-black shadow-md rounded-lg
      w-full max-h-dvh xl:w-[40%] space-y-1 outline-none overflow-y-scroll"
    >
      {(searchSuggestions).map((item, index) => (
        <button
          key={index}
          className="w-full flex text-left space-x-2 p-2 outline-none
          hover:bg-gray-700 focus:bg-gray-700 rounded-md cursor-pointer"
          onClick={() => handleClick(item)}
        >
          <IoIosSearch className="mt-1" />
          <span className="ml-2">{convertToPlainText(item)}</span>
        </button>
      ))}
    </div>
  );
}
