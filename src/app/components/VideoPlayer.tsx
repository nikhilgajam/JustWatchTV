import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import localStoreApi from "@/utils/localStorageApi";
import { useContextData } from "../context/Context";

export default function VideoPlayer() {
  const { data, selectedVideo, setSelectedVideo, playerRef } = useContextData();

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save video progress to local storage before the window is closed or refreshed
      if (selectedVideo?.id && !selectedVideo?.title) {
        const selectedVideoData = {
          id: selectedVideo.id,
          title: selectedVideo.title,
          playingTime: playerRef.current?.getCurrentTime() || 0,
          playlistId: selectedVideo.playlistId || undefined,
        };

        localStoreApi.addPreviouslyWatchedData(selectedVideoData);
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Save the currently playing video to local storage when the component mounts
    if (selectedVideo?.id && selectedVideo?.title) {
      localStoreApi.addPreviouslyWatchedData({
        id: selectedVideo.id,
        title: selectedVideo.title,
        playingTime: playerRef.current?.getCurrentTime() || 0,
        playlistId: selectedVideo.playlistId || undefined,
      });
    }
  }, [selectedVideo]);

  return (
    <div className="flex flex-col w-full h-full justify-center items-center bg-black p-4 rounded-xl shadow-gray-700 shadow-md">
      <ReactPlayer
        key={selectedVideo?.playlistId || selectedVideo?.id}
        className="max-w-full"
        ref={playerRef}
        url={`https://www.youtube.com/embed/${selectedVideo?.id}`}
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
            setSelectedVideo({
              ...data?.items[currentIndex + 1]
            });
          }
        }}
        config={{
          youtube: {
            playerVars: {
              list: selectedVideo?.playlistId || undefined,
            }
          }
        }}
      />
    </div>
  );
}
