import React from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

// This component includes the Navbar and Home components, and sets up a Toaster for notifications
export default function JustWatchHost() {
  return (
    <>
      {/* Toaster Displays The Popups */}
      <Toaster
        toastOptions={{
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
          },
        }}
      />
      {/* Components To Load On Screen */}
      <Navbar />
      <Home />
    </>
  );
}
