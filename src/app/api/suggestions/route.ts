import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/utils/YoutubeSearchAPI"

if (process.env.ENV === 'DEV') {
  // Disable certificate validation globally for Node.js for development
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const suggestions = await getSearchSuggestions(query);

    // Return the results as JSON
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
