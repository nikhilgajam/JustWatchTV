import React from "react";
import TimeBadge from "./TimeBadge";
import { useContextData } from "../context/Context";
import localStoreApi from "@/utils/localStorageApi";
import { isShorts } from "@/utils/helpers";

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
          {videoData?.type === "video" && videoData?.publishedTimeText && (
            <div className={`mt-1 text-sm ${selectedVideo?.id === videoData?.id ? "text-gray" : "text-gray-400"}`}>
              {`${videoData?.channelTitle || "Unknown Channel"} • ${videoData.viewCountText || "Unknown Views"} • ${videoData.publishedTimeText || "Unknown Date"}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
