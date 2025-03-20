import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { searchTools } from "./tools/searchTools.js";


console.log(`API KEY: ${process.env.YOUTUBE_API_KEY}`);

const PORT = process.env.PORT || 3001;
let transport: SSEServerTransport;


const server = new McpServer({
    name: "remote-mcp-server",
    version: "1.0.0"
});


[...searchTools].forEach((tool) => {
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
});


// server.tool(
//     "echo",
//     "Echo a message",
//     { message: z.string() },
//     async ({ message }) => ({
//         content: [{ type: "text", text: `Tool echo: ${message}` }]
//     })
// );

const app = express();

app.get("/sse", async (req, res) => {

    console.log("Received SSE connection");

    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);

});

app.post("/message", async (req, res) => {

    console.log(`Received POST message:`);
    console.log(req.body);

    await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});