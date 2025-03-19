import express from "express";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";


const PORT = process.env.PORT || 3001;
let transport: SSEServerTransport;


const server = new McpServer({
    name: "remote-mcp-server",
    version: "1.0.0"
});

server.tool(
    "echo",
    "Echo a message",
    { message: z.string() },
    async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }]
    })
);

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