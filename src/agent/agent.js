const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const {
  HumanMessage,
  AIMessage,
  SystemMessage,
} = require("@langchain/core/messages");
const { createTask, listTasks } = require("./tools");

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

const history = [
  new SystemMessage(`
You are an AI task assistant.

If user wants to create a task, respond ONLY:
TOOL:createTask:<task title>

If user wants to list tasks or ask about tasks:
TOOL:listTasks

Otherwise respond normally.
`),
];

async function runAgent(userInput) {
  console.log("🤖 Agent received:", userInput);

  history.push(new HumanMessage(userInput));

  const res = await llm.invoke(history);
  let reply = res.content;

  if (reply.startsWith("TOOL:")) {
    const [, action, payload] = reply.split(":");

    if (action === "createTask") {
      const task = await createTask({ title: payload });

      const textReply = `Task created: ${task.title}`;
      history.push(new AIMessage(textReply));

      return textReply;
    }

    if (action === "listTasks") {
      const tasks = await listTasks();

      const textReply = tasks.length
        ? tasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n")
        : "No tasks available";

      history.push(new AIMessage(textReply));
      return textReply;
    }
  }

  history.push(new AIMessage(reply));
  return reply;
}

module.exports = { runAgent };
