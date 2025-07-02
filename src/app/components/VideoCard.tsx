import React from "react";
import TimeBadge from "./TimeBadge";
import { useContextData } from "../context/Context";
import localStoreApi from "@/utils/localStorageApi";

export default function VideoCard({ videoData }: { videoData: any }) {
  const { setSelectedVideo, homePageRef, setIsVideoPlayerOpen, selectedVideo, playerRef } = useContextData();

  const handleVideoClick = () => {
    if (selectedVideo?.id && selectedVideo?.title) {
      localStoreApi.addPreviouslyWatchedData({
        id: selectedVideo.id || "",
        title: selectedVideo.title || "",
        playingTime: playerRef.current?.getCurrentTime() || 0,
        playlistId: selectedVideo.playlistId || undefined,
        index: selectedVideo.playlistId
          ? playerRef.current?.getInternalPlayer()?.getPlaylistIndex() || 0
          : undefined,
      });
    }

    setSelectedVideo(videoData);
    homePageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setIsVideoPlayerOpen?.(true);
  };

  const isShorts = (duration: string) => {
    if (!duration) return false;
    const parts = duration.split(':');

    if (parts.length === 1) {
      // Format: "45" (seconds only)
      return parseInt(parts[0]) <= 60;
    } else if (parts.length === 2) {
      // Format: "1:44" (minutes:seconds)
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      const totalSeconds = minutes * 60 + seconds;
      return totalSeconds <= 63;
    }

    // If duration has more than 2 parts or is longer, it's not a short
    return false;
  };

  // Condition to not include shorts
  if (!localStoreApi.getIncludeShorts()
    && videoData?.type !== "playlist"
    && (videoData?.isShorts || isShorts(videoData?.length?.simpleText))) {
    return null;
  }

  return (
    <div id={videoData?.id}>
      <div
        className="cursor-pointer"
        onClick={handleVideoClick}
        onKeyDown={(e) => e.key === 'Enter' && handleVideoClick()}
        tabIndex={0} // Make the div focusable for tab accessibility
        role="button"
        aria-label={`Play video: ${videoData?.title || "Unknown Title"}`}
      >
        <div className={`flex flex-col justify-center items-center p-2 rounded-xl 
          shadow-lg shadow-gray-900 hover:bg-gray-700 transition-colors overflow-x-hidden
          ${selectedVideo?.id === videoData?.id ? "bg-orange-500 hover:bg-orange-800" : ""}`}
        >
          {/* Thumbnail */}
          <div className="relative h-56 rounded-xl overflow-hidden">
            <img
              className="h-full w-full"
              alt={videoData?.title || "Video Thumbnail"}
              src={videoData?.thumbnail?.thumbnails[1]?.url ?? videoData?.thumbnail?.thumbnails[0]?.url}
            />
            {/* Time Display Badge */}
            {videoData?.length?.simpleText && (<TimeBadge time={videoData.length.simpleText} />)}
            {!videoData?.length?.simpleText && videoData?.isLive && (<TimeBadge time={"LIVE"} />)}
            {!videoData?.length?.simpleText && videoData?.type === "playlist" && (<TimeBadge time={"PLAYLIST"} />)}
          </div>

          {/* Video Data */}
          <div className="mt-2 text-white text-base" title={videoData?.title || "Unknown Title"}>
            {videoData?.title || "Unknown Title"}
          </div>
          {
            /* <div className="mt-1 text-white font-semibold text-base">
              {videoData?.channelTitle || "Unknown Channel"}
            </div> */
          }
        </div>
      </div>
    </div>
  );
}
