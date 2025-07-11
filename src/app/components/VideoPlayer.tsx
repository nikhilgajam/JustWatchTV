"use client";

import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import localStoreApi from "@/utils/localStorageApi";
import { useContextData } from "../context/Context";
import { isShorts } from "@/utils/helpers";

export default function VideoPlayer() {
  const { data, loading, selectedVideo, setSelectedVideo, playerRef } = useContextData();

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save video progress to local storage before the window is closed or refreshed
      if (selectedVideo?.id && selectedVideo?.title) {
        const selectedVideoData = {
          id: selectedVideo.id,
          title: selectedVideo.title,
          playingTime: playerRef.current?.getCurrentTime() || 0,
          playlistId: selectedVideo.playlistId || undefined,
          index: selectedVideo.playlistId
            ? playerRef?.current?.getInternalPlayer()?.getPlaylistIndex() || 0
            : undefined,
        };

        localStoreApi.addPreviouslyWatchedData(selectedVideoData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full justify-center items-center
    bg-black p-4 rounded-xl shadow-gray-700 shadow-md
    h-[300px] md:h-[540px] 2xl:h-[650px]">
      <ReactPlayer
        key={selectedVideo?.playlistId || selectedVideo?.id}
        className="max-w-full"
        width={loading ? `${window.innerWidth}px` : "100%"} // Setting the width to screen width when loading
        height={"100%"}
        ref={playerRef}
        url={`https://www.youtube-nocookie.com/embed/${selectedVideo?.id}`} // https://www.youtube.com/embed/${selectedVideo?.id}
        controls={true}
        playing={true}
        onReady={async () => {
          // Save the currently playing video to local storage when the component mounts
          if (selectedVideo?.id && selectedVideo?.title) {
            localStoreApi.addPreviouslyWatchedData({
              id: selectedVideo.id,
              title: selectedVideo.title,
              playingTime: playerRef.current?.getCurrentTime() || 0,
              playlistId: selectedVideo.playlistId || undefined,
              index: selectedVideo.playlistId
                ? playerRef.current?.getInternalPlayer()?.getPlaylistIndex() || 0
                : undefined,
            });
          }

          // If index is available, play that video in a playlist
          if (selectedVideo?.index) {
            await playerRef.current?.getInternalPlayer()?.playVideoAt(selectedVideo.index);
          }
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

          let nextVideo = null;
          for (let i = currentIndex + 1; i < data?.items?.length; i++) {
            // If the next video is a short, skip if shorts are not included
            if (localStoreApi.getIncludeShorts() === false
              && (data?.items[i]?.isShorts || isShorts(data?.items[i]?.length?.simpleText))) {
              continue;
            }

            // Assign the next video data here
            nextVideo = data?.items[i];
            break;
          }

          // If there is a next video, play it
          if (nextVideo) {
            setSelectedVideo({
              ...nextVideo
            });
          }
        }}
        config={{
          youtube: {
            playerVars: {
              list: selectedVideo?.playlistId || undefined,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            embedOptions: {
              host: 'https://www.youtube-nocookie.com'
            }
          },
        }}
      />
    </div>
  );
}
