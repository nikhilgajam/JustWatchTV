import { NextRequest, NextResponse } from "next/server";
import { NextPage } from "@/utils/YoutubeSearchAPI"

if (process.env.ENV === 'DEV') {
  // Disable certificate validation globally for Node.js for development
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function POST(request: NextRequest) {
  // Get the data from body
  const body = await request.json();

  try {
    // Fetch data from YouTube using youtube-sr
    const data = await NextPage(body.data.nextPageObj, false, 100);

    if (!data?.items || data.items.length === 0) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    // Return the results as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
