import React from "react";
import ContextProvider from "./context/Context";
import JustWatchHost from "./JustWatchHost";

export default function Main() {
  // This is the main entry point for the JustWatch TV application.
  // And wraps the JustWatchHost component with the ContextProvider to provide global state management.
  return (
    <ContextProvider>
      <JustWatchHost />
    </ContextProvider>
  );
}
