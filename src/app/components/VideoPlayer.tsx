"use client";

import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import localStoreApi from "@/utils/localStorageApi";
import { useContextData } from "../context/Context";

export default function VideoPlayer() {
  const { data, selectedVideo, setSelectedVideo, playerRef } = useContextData();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedVideo?.id && selectedVideo?.title) {
        const selectedVideoData = {
          id: selectedVideo.id,
          title: selectedVideo.title,
          playingTime: playerRef.current?.getCurrentTime() || 0,
        };

        localStoreApi.addPreviouslyWatchedData(selectedVideoData);
      }
    }
    // Save video progress to Local Storage before the window is closed or refreshed
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, []);

  useEffect(() => {
    if (selectedVideo?.id && selectedVideo?.title) {
      // Save the currently playing video to Local Storage when the component mounts
      localStoreApi.addPreviouslyWatchedData({
        id: selectedVideo.id,
        title: selectedVideo.title,
        playingTime: playerRef.current?.getCurrentTime() || 0,
      });
    }
  }, [selectedVideo]);

  return (
    <div className="flex flex-col w-full h-full justify-center items-center bg-black p-4 rounded-xl shadow-gray-700 shadow-md">
      <ReactPlayer
        className="max-w-full"
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${selectedVideo?.id}`}
        controls={true}
        playing={true}
        onReady={() => {
          // If playingTime is available, play from that time
          if (selectedVideo?.playingTime) {
            playerRef.current?.seekTo(selectedVideo.playingTime, "seconds");
          }
        }}
        onEnded={() => {
          if (localStoreApi.getAutoPlay() === false)
            return;

          // get index of the current video in the data array
          const currentIndex = data?.items?.findIndex(
            (video: any) => video.id === selectedVideo?.id
          );
          // If there is a next video, play it
          if (currentIndex !== -1 && currentIndex < data?.items?.length - 1) {
            const nextVideoId = data?.items[currentIndex + 1]?.id;
            setSelectedVideo({
              id: nextVideoId,
            });

            // Save the next selected video data to the local storage
            localStoreApi.addPreviouslyWatchedData({
              id: nextVideoId,
              title: data?.items[currentIndex + 1]?.title,
              playingTime: 0,
            });
          }
        }}
        config={{
          youtube: {
            playerVars: {
              showinfo: 1, // Show video information
              rel: 1, // Show related videos at the end
              iv_load_policy: 3, // Disable annotations
            }
          }
        }}
      />
    </div>
  );
}
