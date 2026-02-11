import OpenAI from "openai";
import fs from "fs/promises";

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

  const response = await client.chat.completions.create({
    model: "anthropic/claude-haiku-4.5",
    messages: [{ role: "user", content: prompt }],
    tools: [{
      "type": "function",
      "function": {
        "name": "ReadFile",
        "description": "Read and return the contents of a file",
        "parameters": {
          "type": "object",
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The path to the file to read"
            }
          },
          "required": ["file_path"]
        }
      }
    }],
  });

  if (!response.choices || response.choices.length === 0) {
    throw new Error("no choices in response");
  }

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");

  const choice = response.choices[0]; // There is always one choice
  const message = choice.message;

  console.log(message.content); // Display message content for user
  const tool_calls = message.tool_calls;
  
  /* Run first tool from calls */
  const func = tool_calls[0];
  /* Identify function */
  const name = func.function.name;
  
  if (name == "ReadFile") {
    // Is the read tool
    // Get file path
    const json = func.function.arguments;
    const parsed = JSON.parse(json);

    const data = await readFile(parsed.file_path);  // Read file content
    console.log(data);
  }
}

async function readFile(filepath) {
  try {
    const data = await fs.readFile(filepath, 'utf-8')
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

main();
