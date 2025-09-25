"use client";

import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import localStoreApi from "@/utils/localStorageApi";
import { useContextData } from "../context/Context";
import { isShorts } from "@/utils/helpers";

export default function VideoPlayer() {
  const { data, loading, selectedVideo, setSelectedVideo, playerRef } = useContextData();
  const pendingSeekTime = useRef<number | null>(null);

  const saveVideoMetadata = () => {
    // Save the currently playing video to local storage when the video starts
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
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveVideoMetadata(); // Save video metadata before the page unloads
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex flex-col w-full justify-center items-center 
    bg-black p-4 rounded-xl shadow-gray-700 shadow-md
    h-[300px] md:h-[540px] 2xl:h-[650px]">
      <ReactPlayer
        className="max-w-full"
        ref={playerRef}
        width={loading ? `${window.innerWidth}px` : "100%"}
        height={"100%"}
        url={`https://www.youtube.com/embed/${selectedVideo?.id}`} // https://www.youtube-nocookie.com/embed/${selectedVideo?.id}
        controls={true}
        playing={true}
        onPlay={() => {
          saveVideoMetadata(); // Save video metadata when the player is playing
        }}
        onReady={async () => {
          const player = playerRef.current?.getInternalPlayer();

          // Store the time we want to seek to
          if (selectedVideo?.playingTime) {
            pendingSeekTime.current = selectedVideo.playingTime;
          }

          // Set up state change listener for YouTube player
          if (player && player.addEventListener) {
            player.addEventListener('onStateChange', (event: any) => {
              // State 1 means the video is playing
              if (event.data === 1 && pendingSeekTime.current !== null) {
                player.seekTo(pendingSeekTime.current, true);
                pendingSeekTime.current = null; // Clear after seeking
              }
            });
          }

          // If index is available, play that video in a playlist
          if (selectedVideo?.index) {
            await player?.playVideoAt(selectedVideo.index);
          } else if (selectedVideo?.playingTime && !selectedVideo?.playlistId) {
            // For non-playlist videos, use ReactPlayer's seekTo immediately
            playerRef.current?.seekTo(selectedVideo.playingTime, "seconds");
          }

          saveVideoMetadata(); // Save video metadata when the player is ready
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
            }
          },
        }}
      />
    </div>
  );
}
