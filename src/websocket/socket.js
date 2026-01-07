const WebSocket = require("ws");
const { runAgent } = require("../agent/agent");
const { listTasks } = require("../agent/tools");



function initSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws) => {
    console.log("🔌 WebSocket client connected");

    const initialTasks = await listTasks();

    ws.send(JSON.stringify({
      type: "tasks",
      payload: initialTasks,
    }));

    ws.on("message", async (message) => {
      const userInput = message.toString();
      console.log("📥 Received:", userInput);

      try {
        const aiReply = await runAgent(userInput);

        ws.send(JSON.stringify({
          type: "chat",
          content: aiReply,
        }));

        const tasks = await listTasks();
        ws.send(JSON.stringify({
          type: "tasks",
          payload: tasks,
        }));

      } catch (err) {
        console.error("❌ Agent error:", err);
        ws.send(JSON.stringify({
          type: "error",
          message: "Something went wrong",
        }));
      }
    });

    ws.on("close", () => {
      console.log("🔴 Client disconnected");
    });
  });
}

module.exports = initSocket;
