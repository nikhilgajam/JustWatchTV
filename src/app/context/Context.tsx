"use client";

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useRef,
} from "react";
import { getSearchData, getPlaylists } from "@/utils/apiRequests";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import localStoreApi from "@/utils/localStorageApi";
import { isShorts } from "@/utils/helpers";

interface ContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  data: any;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchSuggestions: any[];
  setSearchSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedVideo: any;
  setSelectedVideo: React.Dispatch<React.SetStateAction<any>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isVideoPlayerOpen?: boolean;
  setIsVideoPlayerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  triggerSearch: boolean;
  setTriggerSearch: React.Dispatch<React.SetStateAction<boolean>>;
  homePageRef: React.RefObject<HTMLDivElement | null>;
  playerRef: React.RefObject<ReactPlayer | null>;
}

export const Context = createContext<ContextType | null>(null);

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);
  const homePageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayer>(null);

  const fetchData = async (query: string) => {
    try {
      setData(() => []);
      setLoading(true);
      try {
        const response = await getSearchData(query);

        let playlistResponse = null;
        // Fetch playlists if the user has opted to include them
        if (localStoreApi.getIncludePlaylists()) {
          playlistResponse = await getPlaylists(query);
        }

        if (response?.data?.items && response.data.items.length > 0) {
          if (playlistResponse) {
            // Merge playlist items with search results and place at the beginning
            response.data.items.unshift(...playlistResponse?.data?.items);
          }

          // Include only videos and playlists
          response.data.items = response.data.items.filter((item: any) => {
            if (item.type === "video" || item.type === "playlist") {
              return true;
            }
            return false;
          });

          setData(response.data);

          // If video player is not open then set the first video as selected
          if (!isVideoPlayerOpen) {
            let startVideo = null;
            for (let i = 0; i < response.data?.items?.length; i++) {
              // If the next video is a short, skip if shorts are not included
              if (localStoreApi.getIncludeShorts() === false
                && (response.data?.items[i]?.isShorts || isShorts(response.data?.items[i]?.length?.simpleText))) {
                continue;
              }

              // Assign the next video data here
              startVideo = response.data?.items[i];
              break;
            }

            setSelectedVideo({
              id: startVideo?.id,
              title: startVideo?.title,
              playlistId: startVideo?.playlistId,
              type: startVideo?.type
            })
          }

          setSearchSuggestions([]);
          homePageRef?.current?.focus();
          setError("");
        } else {
          toast.error("No data found for the given query.");
        }
      } catch (error) {
        toast.error("Error fetching data.");
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    }
    catch (error: any) {
      console.error("Error in fetchData:", error);
      setError(error.message || "An error occurred while fetching data.");
      toast.error("Error fetching data.");
    }
  }

  // Trigger search when searchQuery changes
  useEffect(() => {
    // If triggerSearch is true and searchQuery is not empty, fetch data
    if (triggerSearch && searchQuery.trim()) {
      fetchData(searchQuery);
      setTriggerSearch(false);
    }
  }, [triggerSearch, searchQuery]);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData(localStoreApi.getDefaultSearchString());
  }, []);

  const value: ContextType = {
    loading,
    setLoading,
    error,
    setError,
    data,
    setData,
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    setSearchSuggestions,
    selectedVideo,
    setSelectedVideo,
    isSidebarOpen,
    setIsSidebarOpen,
    isVideoPlayerOpen,
    setIsVideoPlayerOpen,
    triggerSearch,
    setTriggerSearch,
    homePageRef,
    playerRef,
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export const useContextData = (): ContextType => {
  const context = useContext(Context);
  if (context === null) {
    throw new Error("useContextData must be used within a ContextProvider");
  }
  return context;
};
