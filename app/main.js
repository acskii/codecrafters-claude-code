import OpenAI from "openai";
import bundleTools from "./bundleTools.js";

async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  /* Get history of tools that can be advertised */
  const bundle = await bundleTools();

  const messageHistory = [{ role: "user", content: prompt }];
  const availableTools = bundle.availableTools;

  while (true) {
    const response = await client.chat.completions.create({
      model: "anthropic/claude-haiku-4.5",
      messages: messageHistory,
      tools: availableTools,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }
    
    const choice = response.choices.at(-1);
    const message = choice.message;
    messageHistory.push(message);

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const tool of message.tool_calls) {
        /* Identify function */
        const name = tool.function.name;
        const id = tool.id;
        const args = tool.function.arguments;

        if (bundle.runLookup[name]) {
          // Run tool function
          const output = bundle.runLookup[name](JSON.parse(args));

          // Push tool result into history
          messageHistory.push({
              "role": "tool",
              "tool_call_id": id,
              "content": output
            }
          );
        }
      };
    } else {
      console.log(message.content); // Display message content for user
      break;
    }
  }
}

main();
