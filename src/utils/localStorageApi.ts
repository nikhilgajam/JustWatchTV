const DataConstant = 'JustWatchTV';
const initialLocalStorageData = {
  searchSuggestion: true,
  autoPlay: true,
  defaultSearchString: "Trending Scientific Documentaries",
  quickSearch: ["Ben 10", "Tom And Jerry Tales"],
  previouslyWatchedData: [],
  maxHistoryLength: 10, // Maximum number of previously watched videos to keep
};


/*
  * This is the API for Local Storage.
  * Contains functions to get and set the Data in Local Storage.
*/
const localStoreApi = {
  // These functions will return and set the Quiz Data in Local Storage or Session Storage.
  getStorageData() {
    const quizDataObj = localStorage.getItem(DataConstant);
    return quizDataObj === null ? initialLocalStorageData : JSON.parse(quizDataObj);
  },
  setStorageData(quizDataObj: any) {
    const quizDataObjString = JSON.stringify(quizDataObj);
    localStorage.setItem(DataConstant, quizDataObjString);
  },

  // These functions will return and toggle the Search Suggestion in Local Storage.
  getSearchSuggestion() {
    const dataObj = this.getStorageData();
    return dataObj.searchSuggestion;
  },
  toggleSearchSuggestion() {
    const dataObj = this.getStorageData();
    this.setStorageData({ ...dataObj, searchSuggestion: !dataObj.searchSuggestion });
  },

  // These functions will return and toggle the Auto Play in Local Storage.
  getAutoPlay() {
    const dataObj = this.getStorageData();
    return dataObj.autoPlay;
  },
  toggleAutoPlay() {
    const dataObj = this.getStorageData();
    this.setStorageData({ ...dataObj, autoPlay: !dataObj.autoPlay });
  },

  // These functions will return and set the Default Search String in Local Storage.
  getDefaultSearchString() {
    const dataObj = this.getStorageData();
    return dataObj.defaultSearchString;
  },
  setDefaultSearchString(value: string) {
    const dataObj = this.getStorageData();
    this.setStorageData({ ...dataObj, defaultSearchString: value });
  },

  // These functions will return, set and modify the Quick Storage in Local Storage.
  getQuickSearch(): Array<string> {
    const dataObj = this.getStorageData();
    return dataObj.quickSearch;
  },
  setQuickSearch(data: Array<string>) {
    const dataObj = this.getStorageData();
    this.setStorageData({ ...dataObj, quickSearch: data });
  },
  addQuickSearchItem(data: string) {
    const dataObj = this.getStorageData()
    const quickSearch = dataObj.quickSearch || [];
    if (!quickSearch.includes(data)) {
      quickSearch.push(data)
      this.setStorageData({ ...dataObj, quickSearch });
    }
  },
  deleteQuickSearchItem(data: string) {
    const dataObj = this.getStorageData()
    const quickSearch = dataObj.quickSearch || []
    const index = quickSearch.indexOf(data)
    if (index > -1) {
      quickSearch.splice(index, 1)
      this.setStorageData({ ...dataObj, quickSearch })
    }
  },
  editQuickSearchItem(oldData: string, newData: string) {
    const dataObj = this.getStorageData()
    const quickSearch = dataObj.quickSearch || []
    const index = quickSearch.indexOf(oldData)
    if (index > -1) {
      quickSearch[index] = newData
      this.setStorageData({ ...dataObj, quickSearch })
    }
  },

  // These functions will return and add the Last Seen Videos in Local Storage.
  getPreviouslyWatchedData() {
    const dataObj = this.getStorageData();
    return dataObj.previouslyWatchedData;
  },
  addPreviouslyWatchedData(video: any) {
    if (!video || !video.id) return; // Ensure video has an id

    const dataObj = this.getStorageData();
    let previouslyWatchedData = dataObj.previouslyWatchedData || [];

    // Check if the video already exists in the previouslyWatchedData array
    const videoExists = previouslyWatchedData.some((v: any) => v.id === video?.id);
    if (videoExists) {
      // If exists, update the existing video and move to the top
      previouslyWatchedData = previouslyWatchedData.filter((v: any) => v.id === video?.id); // Filter out the existing video
      previouslyWatchedData.unshift({ ...video }); // Add the updated video to the beginning
    } else {
      // Add the new video to the beginning of the array
      previouslyWatchedData.unshift(video);

      // Limit the array to the maxHistoryLength videos
      if (previouslyWatchedData.length > (dataObj?.maxHistoryLength ?? 10)) {
        previouslyWatchedData.pop();
      }
    }

    // Update the local storage with the new previouslyWatchedData array
    this.setStorageData({ ...dataObj, previouslyWatchedData });
  },

  // This function will return the constant used for the Storage Event.
  getStorageEventConstant() {
    return DataConstant
  }
}

export default localStoreApi;
