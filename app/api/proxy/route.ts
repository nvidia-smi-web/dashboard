import { NextRequest, NextResponse } from "next/server";

const SERVERS = process.env.SERVERS ? JSON.parse(process.env.SERVERS) : {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId } = body;

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    interface ServerResponse {
      code?: number;
      error?: string;
      [key: string]: unknown;
    }

    const fetchServerData = async (id: string): Promise<ServerResponse> => {
      const serverConfig = SERVERS[id as keyof typeof SERVERS];

      if (!serverConfig?.url) {
        return { code: 1, error: "Invalid server ID" };
      }

      try {
        const response = await fetch(serverConfig.url, {
          headers: serverConfig.token ? { 'Authorization': serverConfig.token } : {}
        });
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in proxy API:", id, error);
        return { code: 2, error: "Failed to fetch server data" };
      }
    };

    if (Array.isArray(serverId)) {
      const results: Record<string, ServerResponse> = {};
      const promises = serverId.map(async (id) => {
        results[id] = await fetchServerData(id);
      });
      await Promise.all(promises);
      return NextResponse.json(results);
    } else {
      const data = await fetchServerData(serverId);
      if (data.code === 1) {
        return NextResponse.json({ error: data.error }, { status: 400 });
      }
      if (data.code === 2) {
        return NextResponse.json({ error: data.error }, { status: 500 });
      }
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error in proxy API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
