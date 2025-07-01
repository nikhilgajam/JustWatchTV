import { NextRequest, NextResponse } from "next/server";
import { GetPlaylists } from "@/utils/YoutubeSearchAPI"

if (process.env.ENV === 'DEV') {
  // Disable certificate validation globally for Node.js for development
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    // Fetch data
    const data = await GetPlaylists(query);

    if (!data || !data?.items) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    // Return the results as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
