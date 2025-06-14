import React, { useState, useEffect } from "react";
import { FaArrowCircleUp } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useContextData } from "../context/Context";
import toast from "react-hot-toast";

const ScrollButton = () => {
  const { homePageRef, selectedVideo, data } = useContextData();
  const [isUp, setIsUp] = useState(false);

  const toggleVisible = () => {
    const scrolled: any = homePageRef?.current?.scrollTop;

    if (scrolled > 200) {
      setIsUp(true);
    } else if (scrolled <= 200) {
      setIsUp(false);
    }
  };

  const scrollToTop = () => {
    homePageRef?.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const scrollToVideo = () => {
    // Check if the selected video exists in the data array
    const videoExists = data?.items?.some((video: any) => video.id === selectedVideo?.id);

    if (!videoExists) {
      toast("Video not found on the screen to scroll.", {
        style: {
          backgroundColor: "#333",
          color: "#fff",
        }
      });

      return;
    }

    // Scroll to selected video using id
    const videoElement = document.getElementById(selectedVideo?.id);
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: "smooth" });
    }
  }
  
  useEffect(() => {
    const container = homePageRef?.current;
    if (container) {
      container.addEventListener("scroll", toggleVisible);

      // Cleanup the event listener on component unmount
      return () => {
        container.removeEventListener("scroll", toggleVisible);
      };
    }
  }, [homePageRef]);

  return (
    <div className="button scroll-button text-4xl text-white fixed bottom-6 right-6 cursor-pointer
    hover:text-blue-400 transition-all duration-300 z-50">
      {isUp ?
        <FaArrowCircleUp
          onClick={scrollToTop}
          title="Scroll To Top"
        />
        :
        <FaCheckCircle
          onClick={scrollToVideo}
          title="Scroll To Selected Video"
        />
      }
    </div>
  );
};

export default ScrollButton;
