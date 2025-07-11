import axios from "axios";
const youtubeEndpoint = `https://www.youtube.com`;

/**
 * npm youtube-search-api
 * GitHub: https://github.com/damonwonghv/youtube-search-api
*/

const GetYoutubeInitData = async (url) => {
  var initdata = await {};
  var apiToken = await null;
  var context = await null;
  try {
    const page = await axios.get(encodeURI(url));
    const ytInitData = await page.data.split("var ytInitialData =");
    if (ytInitData && ytInitData.length > 1) {
      const data = await ytInitData[1].split("</script>")[0].slice(0, -1);

      if (page.data.split("innertubeApiKey").length > 0) {
        apiToken = await page.data
          .split("innertubeApiKey")[1]
          .trim()
          .split(",")[0]
          .split('"')[2];
      }

      if (page.data.split("INNERTUBE_CONTEXT").length > 0) {
        context = await JSON.parse(
          page.data.split("INNERTUBE_CONTEXT")[1].trim().slice(2, -2)
        );
      }

      initdata = await JSON.parse(data);
      return await Promise.resolve({ initdata, apiToken, context });
    } else {
      console.error("cannot_get_init_data");
      return await Promise.reject("cannot_get_init_data");
    }
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetYoutubePlayerDetail = async (url) => {
  var initdata = await {};
  try {
    const page = await axios.get(encodeURI(url));
    const ytInitData = await page.data.split("var ytInitialPlayerResponse =");
    if (ytInitData && ytInitData.length > 1) {
      const data = await ytInitData[1].split("</script>")[0].slice(0, -1);
      initdata = await JSON.parse(data);
      return await Promise.resolve({ ...initdata.videoDetails });
    } else {
      console.error("cannot_get_player_data");
      return await Promise.reject("cannot_get_player_data");
    }
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetData = async (
  keyword,
  withPlaylist = false,
  limit = 0,
  options = []
) => {
  let endpoint = await `${youtubeEndpoint}/results?search_query=${keyword}`;
  try {
    if (Array.isArray(options) && options.length > 0) {
      const type = options.find((z) => z.type);
      if (typeof type == "object") {
        if (typeof type.type == "string") {
          switch (type.type.toLowerCase()) {
            case "video":
              endpoint = `${endpoint}&sp=EgIQAQ%3D%3D`;
              break;
            case "channel":
              endpoint = `${endpoint}&sp=EgIQAg%3D%3D`;
              break;
            case "playlist":
              endpoint = `${endpoint}&sp=EgIQAw%3D%3D`;
              break;
            case "movie":
              endpoint = `${endpoint}&sp=EgIQBA%3D%3D`;
              break;
          }
        }
      }
    }
    const page = await GetYoutubeInitData(endpoint);

    const sectionListRenderer = await page.initdata.contents
      .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer;

    let contToken = await {};

    let items = await [];

    await sectionListRenderer.contents.forEach((content) => {
      if (content.continuationItemRenderer) {
        contToken =
          content.continuationItemRenderer.continuationEndpoint
            .continuationCommand.token;
      } else if (content.itemSectionRenderer) {
        content.itemSectionRenderer.contents.forEach((item) => {
          if (item.channelRenderer) {
            let channelRenderer = item.channelRenderer;
            items.push({
              id: channelRenderer.channelId,
              type: "channel",
              thumbnail: channelRenderer.thumbnail,
              title: channelRenderer.title.simpleText
            });
          } else {
            let videoRender = item.videoRenderer;
            let playListRender = item.playlistRenderer;

            if (videoRender && videoRender.videoId) {
              items.push(VideoRender(item));
            }
            if (withPlaylist) {
              if (playListRender && playListRender.playlistId) {
                items.push({
                  id: playListRender.playlistId,
                  type: "playlist",
                  thumbnail: playListRender.thumbnails,
                  title: playListRender.title.simpleText,
                  length: playListRender.videoCount,
                  videos: playListRender.videos,
                  videoCount: playListRender.videoCount,
                  isLive: false
                });
              }
            }
          }
        });
      }
    });
    const apiToken = await page.apiToken;
    const context = await page.context;
    const nextPageContext = await { context: context, continuation: contToken };
    const itemsResult = limit != 0 ? items.slice(0, limit) : items;
    return await Promise.resolve({
      items: itemsResult,
      nextPage: { nextPageToken: apiToken, nextPageContext: nextPageContext }
    });
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const nextPage = async (nextPage, withPlaylist = false, limit = 0) => {
  const endpoint =
    await `${youtubeEndpoint}/youtubei/v1/search?key=${nextPage.nextPageToken}`;
  try {
    const page = await axios.post(
      encodeURI(endpoint),
      nextPage.nextPageContext
    );
    const item1 =
      page.data.onResponseReceivedCommands[0].appendContinuationItemsAction;
    let items = [];
    item1.continuationItems.forEach((conitem) => {
      if (conitem.itemSectionRenderer) {
        conitem.itemSectionRenderer.contents.forEach((item) => {
          let videoRender = item.videoRenderer;
          let playListRender = item.playlistRenderer;
          if (videoRender && videoRender.videoId) {
            items.push(VideoRender(item));
          }
          if (withPlaylist) {
            if (playListRender && playListRender.playlistId) {
              items.push({
                id: playListRender.playlistId,
                type: "playlist",
                thumbnail: playListRender.thumbnails,
                title: playListRender.title.simpleText,
                length: playListRender.videoCount,
                videos: GetPlaylistData(playListRender.playlistId)
              });
            }
          }
        });
      } else if (conitem.continuationItemRenderer) {
        nextPage.nextPageContext.continuation =
          conitem.continuationItemRenderer.continuationEndpoint.continuationCommand.token;
      }
    });
    const itemsResult = limit != 0 ? items.slice(0, limit) : items;
    return await Promise.resolve({ items: itemsResult, nextPage: nextPage });
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetPlaylistData = async (playlistId, limit = 0) => {
  const endpoint = await `${youtubeEndpoint}/playlist?list=${playlistId}`;
  try {
    const initData = await GetYoutubeInitData(endpoint);
    const sectionListRenderer = await initData.initdata;
    const metadata = await sectionListRenderer.metadata;
    if (sectionListRenderer && sectionListRenderer.contents) {
      const videoItems = await sectionListRenderer.contents
        .twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
        .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer.contents;
      let items = await [];
      await videoItems.forEach((item) => {
        let videoRender = item.playlistVideoRenderer;
        if (videoRender && videoRender.videoId) {
          items.push(VideoRender(item));
        }
      });
      const itemsResult = limit != 0 ? items.slice(0, limit) : items;
      return await Promise.resolve({ items: itemsResult, metadata: metadata });
    } else {
      return await Promise.reject("invalid_playlist");
    }
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetSuggestData = async (limit = 0) => {
  const endpoint = await `${youtubeEndpoint}`;
  try {
    const page = await GetYoutubeInitData(endpoint);
    const sectionListRenderer = await page.initdata.contents
      .twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
      .richGridRenderer.contents;
    let items = await [];
    let otherItems = await [];
    await sectionListRenderer.forEach((item) => {
      if (item.richItemRenderer && item.richItemRenderer.content) {
        let videoRender = item.richItemRenderer.content.videoRenderer;
        if (videoRender && videoRender.videoId) {
          items.push(VideoRender(item.richItemRenderer.content));
        } else {
          otherItems.push(videoRender);
        }
      }
    });
    const itemsResult = limit != 0 ? items.slice(0, limit) : items;
    return await Promise.resolve({ items: itemsResult });
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetChannelById = async (channelId) => {
  const endpoint = await `${youtubeEndpoint}/channel/${channelId}`;
  try {
    const page = await GetYoutubeInitData(endpoint);
    const tabs = page.initdata.contents.twoColumnBrowseResultsRenderer.tabs;
    const items = tabs
      .map((json) => {
        if (json && json.tabRenderer) {
          const tabRenderer = json.tabRenderer;
          const title = tabRenderer.title;
          const content = tabRenderer.content;
          return { title, content };
        }
      })
      .filter((y) => typeof y != "undefined");
    return await Promise.resolve(items);
  } catch (ex) {
    return await Promise.reject(ex);
  }
};

const GetVideoDetails = async (videoId) => {
  const endpoint = await `${youtubeEndpoint}/watch?v=${videoId}`;
  try {
    const page = await GetYoutubeInitData(endpoint);
    const playerData = await GetYoutubePlayerDetail(endpoint);

    const result = await page.initdata.contents.twoColumnWatchNextResults;
    const firstContent = await result.results.results.contents[0]
      .videoPrimaryInfoRenderer;
    const secondContent = await result.results.results.contents[1]
      .videoSecondaryInfoRenderer;
    const res = await {
      id: playerData.videoId,
      title: firstContent.title.runs[0].text,
      thumbnail: playerData.thumbnail,
      isLive: firstContent.viewCount.videoViewCountRenderer.hasOwnProperty(
        "isLive"
      )
        ? firstContent.viewCount.videoViewCountRenderer.isLive
        : false,
      channel:
        playerData.author ||
        secondContent.owner.videoOwnerRenderer.title.runs[0].text,
      channelId: playerData.channelId,
      description: playerData.shortDescription,
      keywords: playerData.keywords,
      suggestion: result.secondaryResults.secondaryResults.results
        .filter((y) => y.hasOwnProperty("compactVideoRenderer"))
        .map((x) => compactVideoRenderer(x))
    };

    return await Promise.resolve(res);
  } catch (ex) {
    return await Promise.reject(ex);
  }
};

const VideoRender = (json) => {
  try {
    if (json && (json.videoRenderer || json.playlistVideoRenderer)) {
      let videoRenderer = null;
      if (json.videoRenderer) {
        videoRenderer = json.videoRenderer;
      } else if (json.playlistVideoRenderer) {
        videoRenderer = json.playlistVideoRenderer;
      }
      var isLive = false;
      if (
        videoRenderer.badges &&
        videoRenderer.badges.length > 0 &&
        videoRenderer.badges[0].metadataBadgeRenderer &&
        videoRenderer.badges[0].metadataBadgeRenderer.style ==
        "BADGE_STYLE_TYPE_LIVE_NOW"
      ) {
        isLive = true;
      }
      if (videoRenderer.thumbnailOverlays) {
        videoRenderer.thumbnailOverlays.forEach((item) => {
          if (
            item.thumbnailOverlayTimeStatusRenderer &&
            item.thumbnailOverlayTimeStatusRenderer.style &&
            item.thumbnailOverlayTimeStatusRenderer.style == "LIVE"
          ) {
            isLive = true;
          }
        });
      }
      let isShorts = false;
      if (videoRenderer.thumbnailOverlays) {
        videoRenderer.thumbnailOverlays.forEach((item) => {
          if (
            item.thumbnailOverlayTimeStatusRenderer &&
            item.thumbnailOverlayTimeStatusRenderer.style &&
            item.thumbnailOverlayTimeStatusRenderer.style == "SHORTS"
          ) {
            isShorts = true;
          }
        });
      }
      const id = videoRenderer.videoId;
      const thumbnail = videoRenderer.thumbnail;
      const title = videoRenderer.title.runs[0].text;
      const shortBylineText = videoRenderer.shortBylineText
        ? videoRenderer.shortBylineText
        : "";
      const lengthText = videoRenderer.lengthText
        ? videoRenderer.lengthText
        : "";
      const channelTitle =
        videoRenderer.ownerText && videoRenderer.ownerText.runs
          ? videoRenderer.ownerText.runs[0].text
          : "";
      const publishedTimeText = videoRenderer.publishedTimeText
        ? videoRenderer.publishedTimeText.simpleText
        : "";
      const viewCountText = videoRenderer.viewCountText
        ? videoRenderer.viewCountText.simpleText
        : "";

      return {
        id,
        type: "video",
        thumbnail,
        title,
        channelTitle,
        shortBylineText,
        length: lengthText,
        isLive,
        isShorts,
        publishedTimeText,
        viewCountText,
      };
    } else {
      return {};
    }
  } catch (ex) {
    throw ex;
  }
};

const compactVideoRenderer = (json) => {
  const compactVideoRendererJson = json.compactVideoRenderer;

  var isLive = false;
  if (
    compactVideoRendererJson.badges &&
    compactVideoRendererJson.badges.length > 0 &&
    compactVideoRendererJson.badges[0].metadataBadgeRenderer &&
    compactVideoRendererJson.badges[0].metadataBadgeRenderer.style ==
    "BADGE_STYLE_TYPE_LIVE_NOW"
  ) {
    isLive = true;
  }
  const result = {
    id: compactVideoRendererJson.videoId,
    type: "video",
    thumbnail: compactVideoRendererJson.thumbnail.thumbnails,
    title: compactVideoRendererJson.title.simpleText,
    channelTitle: compactVideoRendererJson.shortBylineText.runs[0].text,
    shortBylineText: compactVideoRendererJson.shortBylineText.runs[0].text,
    length: compactVideoRendererJson.lengthText,
    isLive
  };
  return result;
};

const GetShortVideo = async () => {
  const page = await GetYoutubeInitData(youtubeEndpoint);
  const shortResult =
    await page.initdata.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents
      .filter((x) => {
        return x.richSectionRenderer;
      })
      .map((z) => z.richSectionRenderer.content)
      .filter((y) => y.richShelfRenderer)
      .map((u) => u.richShelfRenderer)
      .find((i) => i.title.runs[0].text == "Shorts");
  const res = await shortResult.contents
    .map((z) => z.richItemRenderer)
    .map((y) => y.content.reelItemRenderer);
  return await res.map((json) => ({
    id: json.videoId,
    type: "reel",
    thumbnail: json.thumbnail.thumbnails[0],
    title: json.headline.simpleText,
    inlinePlaybackEndpoint: json.inlinePlaybackEndpoint || {}
  }));
};

const GetPlaylists = async (keyword) => {
  let endpoint = `${youtubeEndpoint}/results?search_query=${keyword}&sp=EgIQAw%3D%3D`;
  try {
    const page = await GetYoutubeInitData(endpoint);
    const sectionListRenderer = page.initdata.contents
      .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer;

    let items = [];
    sectionListRenderer.contents.forEach((content) => {
      if (content.itemSectionRenderer) {
        content.itemSectionRenderer.contents.forEach((item) => {
          if (item.lockupViewModel) {
            const playlistId = item?.lockupViewModel?.contentId || null;
            const title = item?.lockupViewModel?.metadata?.lockupMetadataViewModel?.title?.content || null;
            const thumbnails = item?.lockupViewModel?.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel?.image?.sources || null;

            items.push({
              id: playlistId,
              playlistId,
              type: "playlist",
              title: title,
              thumbnail: { thumbnails },
            });
          }
        });
      }
    });

    return Promise.resolve({ items });
  } catch (ex) {
    console.error(ex);
    return Promise.reject(ex);
  }
};


/**
 * npm youtube-sr
 * GitHub: https://github.com/twlite/youtube-sr/blob/main/src/mod.ts
*/

let __fetch;

async function getFetch() {
  // return if fetch is already resolved
  if (typeof __fetch === "function") return __fetch;
  // try to locate fetch in window
  if (typeof window !== "undefined" && "fetch" in window) return window.fetch;
  // try to locate fetch in globalThis
  if ("fetch" in globalThis) return globalThis.fetch;

  // try to resolve fetch by importing fetch libs
  for (const fetchLib of FETCH_LIBS) {
    try {
      const pkg = await import(fetchLib);
      const mod = pkg.fetch || pkg.default || pkg;
      if (mod) return (__fetch = mod);
    } catch { }
  }

  if (isNode) throw new Error(`Could not resolve fetch library. Install one of ${FETCH_LIBS.map((m) => `"${m}"`).join(", ")} or define "fetch" in global scope!`);
  throw new Error("Could not resolve fetch in global scope");
}

async function getHTML(url, requestOptions) {
  requestOptions = Object.assign(
    {},
    {
      headers: Object.assign(
        {},
        {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0"
        },
        requestOptions?.headers || {}
      )
    },
    requestOptions || {}
  );

  return new Promise(async (resolve, reject) => {
    // lazy load fetch
    if (!__fetch) __fetch = await getFetch();
    __fetch(url, requestOptions)
      .then((res) => {
        if (!res.ok) throw new Error(`Rejected with status code: ${res.status}`);
        return res.text();
      })
      .then((html) => resolve(html))
      .catch((e) => reject(e));
  });
}

const getSearchSuggestions = async (query) => {
  if (!query) throw new Error("Search query was not provided!");

  try {
    const res = await getHTML(`https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&gs_ri=youtube&ds=yt&q=${encodeURIComponent(query)}`);
    const partition = res.split("window.google.ac.h(")[1];
    const data = Util.json(partition.slice(0, partition.length - 1));
    return data[1].map((m) => m[0]);
  } catch {
    const res = await getHTML(`https://clients1.google.com/complete/search?client=youtube&gs_ri=youtube&ds=yt&q=${encodeURIComponent(query)}`);
    const searchSuggestions = [];
    res.split("[").forEach((ele, index) => {
      if (!ele.split('"')[1] || index === 1) return;
      return searchSuggestions.push(ele.split('"')[1]);
    });

    searchSuggestions.pop();
    return searchSuggestions;
  }
};

export {
  GetData as GetListByKeyword,
  nextPage as NextPage,
  GetPlaylistData,
  GetSuggestData,
  GetChannelById,
  GetVideoDetails,
  GetShortVideo,
  getSearchSuggestions,
  GetPlaylists,
};
