"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getSearchNextPageData } from "@/utils/apiRequests";
import { useContextData } from "../context/Context";
import { BarLoader } from "react-spinners";
import toast from "react-hot-toast";
import VideoPlayer from "./VideoPlayer";
import VideoCard from "./VideoCard";
import ScrollButton from "./ScrollButton";
import Sidebar from "./Sidebar";
import SearchPane from "./SearchPane";

export default function Home() {
  const {
    data,
    setData,
    error,
    setError,
    loading,
    setLoading,
    isVideoPlayerOpen,
    searchQuery,
    homePageRef,
    isSidebarOpen,
    setIsSidebarOpen,
    searchSuggestions,
  } = useContextData();
  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    const container = homePageRef.current;
    if (!container) return;

    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const isAtBottom = scrollHeight - scrollPosition <= 1; // Small Threshold

    if (isAtBottom !== isBottom) {
      setIsBottom(true);
    }
  };

  const handleLazyLoading = useCallback(async () => {
    try {
      setLoading(true);
      const nextPageData = await getSearchNextPageData(data.nextPage);
      if (nextPageData?.data?.items && nextPageData.data.items.length > 0) {
        // Append new items to the existing data
        setData((prevData: any) => ({
          ...prevData,
          items: [
            ...prevData.items,
            ...nextPageData.data.items.filter(
              // Filter out items that already exist in the current data
              (item: any) => prevData.items.every((prevItem: any) => prevItem.id !== item.id)
            )
          ],
          nextPage: nextPageData.data.nextPage,
        }));
      }
      setError("");
    } catch (error) {
      console.error("Error fetching next page data:", error);
      setError("Error loading more videos. Please try again.");
      toast.error("Error loading more videos. Please try again.");
    } finally {
      setIsBottom(false);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    // No need to load more if not at the bottom or already loading or error occured
    if (!isBottom || loading || error) return;

    if (data?.nextPage?.nextPageToken) {
      handleLazyLoading();
    }
  }, [isBottom]);

  useEffect(() => {
    const container = homePageRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Cleanup the event listener on component unmount
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen items-center overflow-x-hidden overflow-y-hidden">
      <div
        className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        gap-4 p-5 overflow-y-scroll overflow-x-hidden h-full"
        ref={homePageRef}
      >
        {/* Video Player With Animation */}
        {(!loading || isVideoPlayerOpen) && <div
          className={`col-span-full transition-all duration-300 ease-in-out overflow-hidden
            ${isVideoPlayerOpen ? "h-[400px] scale-100" : "h-0 scale-0"}`}
        >
          {isVideoPlayerOpen && <VideoPlayer />}
        </div>}

        {/* Videos List */}
        {data?.items?.length > 0 && data.items.map((video: any) => (
          video?.id && video?.type === "video" && <VideoCard key={video.id} videoData={video} />
        ))}

        {/* Welcome Text */}
        {loading && !searchQuery && !data?.items?.length && (
          <div className="col-span-full flex justify-center items-center text-xl md:text-4xl">
            <h1>Welcome to the JustWatchTV</h1>
          </div>
        )}

        {/* Loading Indicator */}
        {loading &&
          <div className="col-span-full flex justify-center items-center mt-12 mb-12">
            <BarLoader color="white" />
          </div>
        }

        {/* Scroll To Top And Video Toggle Button */}
        {(data?.items?.length > 0) && <ScrollButton />}

        {/* Error Display */}
        {error &&
          <div className="col-span-full text-center text-xl font-semibold text-red-500 mt-4">
            <p>{error}</p>
          </div>
        }
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="mt-12 fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsSidebarOpen(false)} // Close sidebar when overlay is clicked
        ></div>
      )}

      {/* Sidebar With Animation */}
      <div className={`fixed w-full bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {isSidebarOpen ?
          // Actual Sidebar Component
          <Sidebar />
          :
          // Sidebar Placeholder
          <div className="mt-12 fixed top-0 left-0 h-[calc(100vh-3rem)] sm:w-[24%] w-[100%] bg-gray-950" />
        }
      </div>

      {/* Search Pane */}
      {!loading && searchSuggestions.length > 0 && <SearchPane />}
    </div>
  );
}
