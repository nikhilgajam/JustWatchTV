import React, { useState, useEffect } from "react";
import { FaArrowCircleUp } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useContextData } from "../context/Context";

const ScrollButton = () => {
  const { homePageRef, selectedVideo } = useContextData();
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
    // how to scroll to a id using html
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
