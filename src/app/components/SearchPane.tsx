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
      setSearchQuery(query); // Set the search query in context
      setTriggerSearch(true); // Trigger the search
    }
  };

  return (
    <div className="fixed mt-12 top-0 p-4 bg-black shadow-md rounded-lg
      w-full max-h-full xl:w-[40%] overflow-y-scroll"
    >
      {searchSuggestions.map((item, index) => (
        <div
          key={index}
          className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md cursor-pointer"
          onClick={() => handleClick(item)}
        >
          <IoIosSearch />
          <span className="ml-2">{item}</span>
        </div>
      ))}
    </div>
  );
}
