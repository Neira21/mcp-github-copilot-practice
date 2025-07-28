import * as dotenv from "dotenv";
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from "googleapis";

// Create a server instance
const server = new McpServer({
  name: "mcp-stdio-server",
  version: "1.0.0",
});

// Load the Google APIs client library
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Tools
// https://modelcontextprotocol.io/docs/concepts/tools#tool-definition-structure

server.registerTool(
  "get_youtube_channel",
  {
    title: "Get YouTube Channel",
    description: "Search for a YouTube channel by its name.",
    inputSchema: {
      query: z.string().describe("The name of the YouTube channel to search for")
    },
  },
  // Handler for the tool (function to be executed when the tool is called)
  async ({ query }) => {
    console.log("Calling get_youtube_channel with query:", query);

    // Call the youtube API for seach channels
    const res = await youtube.channels.list(
      {
        part: ["snippet"],
        forHandle: query,
        maxResults: 5,
      },
      {}
    );

    // Log the results to the console
    console.table(
      res.data.items?.map((item) => ({
        Title: item.snippet?.title,
        Description: item.snippet?.description,
        Thumbnail: item.snippet?.thumbnails?.default?.url,
        Language: item.snippet?.defaultLanguage,
        Country: item.snippet?.country,
        PublishedAt: item.snippet?.publishedAt,
      }))
    );

    // Return the results to the client
    let formattedResults = "";
    res.data.items?.forEach((item) => {
      formattedResults += `\n\n**Title:** ${item.snippet?.title}\n\n`;
      formattedResults += `**Description:** ${item.snippet?.description}\n\n`;
      formattedResults += `**Thumbnail:** ![Thumbnail](${item.snippet?.thumbnails?.default?.url})\n\n`;
      formattedResults += `**Published At:** ${item.snippet?.publishedAt}\n\n`;
      formattedResults += `**URL:** http://youtube.com/${item.snippet?.customUrl}\n\n`;
    });

    return {
      content: [
        {
          type: "text",
          text:
            formattedResults.length > 0
              ? `# Search results for "${query}"\n\n${formattedResults}`
              : `No results found for "${query}"`,
        },
      ],
    };
  }
);

async function main() {
  // Start the server with Stdio transport
  const transport = new StdioServerTransport();
  // Connect the server to the transport
  await server.connect(transport);

  console.error("This MCP Server is running on stdio 🖥️");
}

main().catch((error) => {
  console.error("👎🏻 Fatal error in main():", error);
  process.exit(1);
});
