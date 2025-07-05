export const isShorts = (duration: string) => {
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
  