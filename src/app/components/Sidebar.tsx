import React, { useState } from "react";
import { MdManageSearch } from "react-icons/md";
import { IoPlayForward } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { SiYoutubeshorts } from "react-icons/si";
import { MdOutlinePlaylistPlay } from "react-icons/md";
import { MdSavedSearch } from "react-icons/md";
import { LiaSearchPlusSolid } from "react-icons/lia";
import { MdHistory } from "react-icons/md";
import { useContextData } from "../context/Context";
import SidebarSwitchItem from "./SidebarSwitchItem";
import SidebarInputItem from "./SidebarInputItem";
import localStoreApi from "@/utils/localStorageApi";
import toast from "react-hot-toast";

export default function Sidebar() {
  const {
    homePageRef,
    setSearchQuery,
    setTriggerSearch,
    setIsSidebarOpen,
    setSelectedVideo,
    setIsVideoPlayerOpen,
  } = useContextData();
  const [quickSearchData, setQuickSearchData] = useState(localStoreApi.getQuickSearch());
  const [previouslyWatchedData] = useState(localStoreApi.getPreviouslyWatchedData());

  const settingsList = [
    {
      name: "Search Suggestions",
      icon: <MdManageSearch />,
      isOn: localStoreApi.getSearchSuggestion(),
      onChange: () => localStoreApi.toggleSearchSuggestion(),
    },
    {
      name: "Autoplay",
      icon: <IoPlayForward />,
      isOn: localStoreApi.getAutoPlay(),
      onChange: () => localStoreApi.toggleAutoPlay(),
    },
    {
      name: "Include Shorts",
      icon: <SiYoutubeshorts />,
      isOn: localStoreApi.getIncludeShorts(),
      onChange: () => localStoreApi.toggleIncludeShorts(),
    },
    {
      name: "Search Playlists",
      icon: <MdOutlinePlaylistPlay />,
      isOn: localStoreApi.getIncludePlaylists(),
      onChange: () => localStoreApi.toggleIncludePlaylists(),
    }
  ];

  const handleQuickSearchChange = (oldValue: string, newValue: string) => {
    const trimmedNewValue = newValue.trim();
    if (trimmedNewValue === "") {
      toast.error("Quick search item cannot be empty.");
      return true; // Error: Empty value
    }

    localStoreApi.editQuickSearchItem(oldValue, trimmedNewValue);
    setQuickSearchData(localStoreApi.getQuickSearch());
    toast.success("Quick search item updated successfully.");
  };

  const handleQuickSearchDelete = (value: string) => {
    localStoreApi.deleteQuickSearchItem(value);
    setQuickSearchData(localStoreApi.getQuickSearch());
    toast.success("Quick search item deleted successfully.");
  }

  const handleQuickSearchClick = (value: string) => {
    setSearchQuery(value);
    setTriggerSearch(true);
    setIsSidebarOpen(false); // Close sidebar after clicked
  };

  const handleDefaultSearchChange = (oldValue: string, newValue: string) => {
    if (newValue.trim() === "") {
      toast.error("Homepage search string cannot be empty.");
      return true; // Error: Empty value
    }

    localStoreApi.setDefaultSearchString(newValue);
    toast.success("Homepage search string updated.");
  }

  const handlePreviouslyWatchedClick = (data: any) => {
    setSelectedVideo(data);
    setIsVideoPlayerOpen?.(true); // Open video player
    setIsSidebarOpen(false); // Close sidebar after clicked
    homePageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`mt-12 fixed top-0 left-0 h-[calc(100vh-3rem)] sm:w-[50%] md:w-[45%] xl:w-[29%] w-[100%]
      bg-gray-950 border-gray-700 sm:border-r overflow-y-scroll overflow-x-hidden px-6 py-1`}>
      <div className="space-y-2 items-center">

        {/* Settings */}
        <div className="items-center space-x-2 mt-4">
          <h1 className="font-semibold cursor-default">Settings</h1>
        </div>
        {
          settingsList.map((item, index) => (
            <SidebarSwitchItem
              key={index}
              icon={item.icon}
              label={item.name}
              state={item.isOn}
              onChange={item.onChange}
            />
          ))
        }
        <br />
        <hr />
        <br />

        {/* Default Search */}
        <div className="items-center space-x-2 mt-4">
          <h1 className="font-semibold cursor-default">Homepage Search String</h1>
        </div>
        <SidebarInputItem
          icon={<TbReportSearch />}
          text={localStoreApi.getDefaultSearchString()}
          onChange={handleDefaultSearchChange}
          isEditEnabled={true}
          isDeleteEnabled={false}
          onClick={() => handleQuickSearchClick(localStoreApi.getDefaultSearchString())}
        />
        <br />
        <hr />
        <br />

        {/* Quick Search */}
        <div className="items-center space-x-2 mt-4">
          <h1 className="font-semibold cursor-default">Quick Search</h1>
        </div>
        {
          quickSearchData.map((item) => (
            <SidebarInputItem
              key={crypto.randomUUID()}
              icon={<MdSavedSearch />}
              text={item}
              isEditEnabled={true}
              isDeleteEnabled={true}
              onChange={handleQuickSearchChange}
              onDelete={handleQuickSearchDelete}
              onClick={() => handleQuickSearchClick(item)}
            />
          ))
        }

        {/* Add New Item Button */}
        <div className="mt-2">
          <SidebarInputItem
            icon={<LiaSearchPlusSolid />}
            text={""}
            isEditEnabled={true}
            isDeleteEnabled={false}
            onChange={(oldValue: string, newValue: string) => {
              if (newValue.trim() === "") {
                toast.error("Quick search item cannot be empty.");
                return;
              }

              localStoreApi.addQuickSearchItem(newValue);
              setQuickSearchData(localStoreApi.getQuickSearch());
              return true; // No error
            }}
          />
        </div>
        <br />
        <hr />
        <br />

        {/* Previously Watched */}
        {previouslyWatchedData?.length > 0 &&
          <div className="items-center space-x-2 mt-4">
            <h1 className="font-semibold cursor-default">Previously Watched</h1>
          </div>
        }
        {previouslyWatchedData?.length > 0 &&
          previouslyWatchedData.map((item: any) => (
            item && item.title &&
            <SidebarInputItem
              key={crypto.randomUUID()}
              icon={<MdHistory />}
              text={item.title}
              isEditEnabled={false}
              isDeleteEnabled={false}
              onClick={() => handlePreviouslyWatchedClick(item)}
            />
          ))
        }
      </div>

      {/* Footer */}
      <div className="mt-6 mb-6 text-gray-500 text-sm cursor-default">
        <p>JustWatchTV Developed by <a href="https://github.com/nikhilgajam" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Nikhil Gajam</a></p>
      </div>
    </div>
  );
}
