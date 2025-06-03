import React from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

// This component includes the Navbar and Home components, and sets up a Toaster for notifications
export default function JustWatchHost() {
  return (
    <>
      {/* Toaster Displays The Popups */}
      <div className="z-[9999]"> {/* z-index defines the order of overlapping */}
        <Toaster
          toastOptions={{
            style: {
              background: "#333", // Dark background
              color: "#fff", // White text
            },
          }}
        />
      </div>
      
      {/* Components To Load On Screen */}
      <Navbar />
      <Home />
    </>
  );
}
