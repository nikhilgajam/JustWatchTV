import axios from "axios";

// This file contains the API calls

export const getSearchData = async (query: string) => {
  try {
    const response = await axios.get("/api/search", {
      params: { query },
    });
    return response;
  } catch (error) {
    console.error("Error fetching search data:", error);
    throw error;
  }
}

export const getSearchNextPageData = async (nextPageObj: any) => {
  try {
    const response = await axios.post("/api/search-next-page", {
      data: {
        nextPageObj,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching search data:", error);
    throw error;
  }
}

export const getSearchSuggestions = async (query: string) => {
  try {
    const response = await axios.get("/api/suggestions",
      {
        params: { query },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw error;
  }
}
