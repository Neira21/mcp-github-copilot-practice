import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { searchTools } from "./tools/searchTools.js";

const PORT = process.env.PORT || 3001;

// Create a new SSEServerTransport instance
let transport: SSEServerTransport;


// Create a new McpServer instance
const server = new McpServer({
    name: "remote-mcp-server",
    version: "1.0.0"
});


// Register the tools
[...searchTools].forEach((tool) => {
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
});

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.get("/sse", async (req, res) => {

    console.log("Received SSE connection 🔗");

    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);

});

// Middleware to handle POST requests
app.post("/message", async (req, res) => {

    console.log(`Received POST message 💌`);

    await transport.handlePostMessage(req, res);
});


// Listen on the specified port
app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT} 🚀`);

});