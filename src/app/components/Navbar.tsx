"use client";

import React, { useEffect, useRef } from "react";
import { getSearchSuggestions } from "@/utils/apiRequests";
import { MdOutlineMenu } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import { PiVideoDuotone } from "react-icons/pi";
import { useContextData } from "../context/Context";
import Image from "next/image";
import toast from "react-hot-toast";
import localStoreApi from "@/utils/localStorageApi";

export default function Navbar() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isVideoPlayerOpen,
    setIsVideoPlayerOpen,
    playerRef,
    selectedVideo,
    setSelectedVideo,
    setSearchSuggestions,
    searchQuery,
    setSearchQuery,
    setTriggerSearch,
    homePageRef,
  } = useContextData();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearching = useRef(false);
  const lastSearchQuery = useRef("");

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>, isLastQuery: boolean) => {
    const query = event.target.value; // Get the trimmed search query
    setSearchQuery(query); // Update the search query in context

    if (localStoreApi.getSearchSuggestion() === false) {
      return; // If search suggestions are disabled
    }

    if (query === "") {
      setSearchSuggestions([]); // Clear search suggestions if the query is empty
      return; // Exit early if the query is empty
    }

    if (!isLastQuery) lastSearchQuery.current = query; // Update the last search query
    if (isSearching.current) return; // Prevent multiple requests

    if (query.length > 0) {
      isSearching.current = true; // Set the flag to indicate a search is in progress

      try {
        const response = await getSearchSuggestions(query);
        setSearchSuggestions(response.data || []); // Update search suggestions
      } catch (error) {
        console.error("Error fetching search data:", error);
        toast.error("Error fetching search data.");
      } finally {
        isSearching.current = false; // Reset the flag after the request completes

        // If lastSearchQuery is not empty make a search request by call the same method with the last search query as true
        if (lastSearchQuery.current && lastSearchQuery.current !== query) {
          const lastQuery = lastSearchQuery.current;
          lastSearchQuery.current = ""; // Clear the last search query
          handleSearch({ target: { value: lastQuery } } as React.ChangeEvent<HTMLInputElement>, true); // Update the input value
        }
      }
    } else {
      setSearchSuggestions([]); // Clear search suggestions if the query is empty
    }
  };

  const handlePlayerToggle = () => {
    if (setIsVideoPlayerOpen) {
      // If the video player is being opened, set the selected video with the current playing time
      if (isVideoPlayerOpen) {
        setSelectedVideo({
          id: selectedVideo?.id || "",
          playingTime: playerRef.current?.getCurrentTime() || 0,
        });
      }

      setIsVideoPlayerOpen(!isVideoPlayerOpen);
    }
  }

  // Handle search input specific key events
  useEffect(() => {
    const ref = searchInputRef.current;
    const handleSearchInputKeys = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setSearchSuggestions(() => []); // Clear search suggestions
        setTriggerSearch(true); // Trigger search on Enter key
        homePageRef?.current?.focus(); // Focus on the home page to scroll to the top
      } else if (event.key === "Escape") {
        setSearchSuggestions([]); // Clear search suggestions
      }
    };

    ref?.addEventListener("keydown", handleSearchInputKeys);

    // Cleanup the event listener on component unmount
    return () => {
      ref?.removeEventListener("keydown", handleSearchInputKeys);
    };
  }, []);

  // Global keyboard shortcut for focusing search
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Focus search input when "/" is pressed and not already in an input field
      if (event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  return (
    <header className="fixed w-full flex flex-row bg-gray-900 px-4 py-1 justify-between items-center z-[9990]">
      {/* Logo Section */}
      <div className="flex">
        {/* Hamburger Button */}
        <button
          className="m-1 cursor-pointer hover:opacity-60 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <MdOutlineMenu className={`text-2xl mt-1 ${isSidebarOpen ? "text-sky-600" : ""}`} />
        </button>
        {/* Logo Button */}
        <button
          className="ml-2 cursor-pointer hover:opacity-60 transition-opacity duration-300"
          onClick={() => window.location.reload()}
        >
          <Image src="/tv.png" alt="JustWatch TV Logo" title="JustWatch TV" width={40} height={40} layout="intrinsic" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex w-[45%]">
        <input
          ref={searchInputRef}
          className="rounded-l-full px-4 py-2 w-[100%] h-[100%] text-base
            hover:bg-gray-800 transition-colors duration-300
            bg-black border
            border-gray-400 border-r-0 outline-none"
          placeholder="Search"
          type="text"
          onChange={(event) => handleSearch(event, false)}
          value={searchQuery}
        />
        <button
          title="Search"
          className="rounded-r-full px-5 bg-gray-600 border
            hover:bg-gray-700 transition-colors duration-300
            border-gray-400 border-l-0"
          onClick={() => setTriggerSearch(true)}
        >
          <IoIosSearch className="ml-[-3px] text-xl" />
        </button>
      </div>

      {/* Video Player Toggle Button */}
      <div className="items-center mt-1">
        <button
          title="Video Player"
          className="cursor-pointer hover:opacity-60 transition-opacity duration-300"
          onClick={handlePlayerToggle}
        >
          <PiVideoDuotone className={`text-3xl ${isVideoPlayerOpen ? "text-red-400" : ""}`} />
        </button>
      </div>
    </header>
  );
}
