import OpenAI from "openai";
import fs from "fs";
import path from "path";

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
  const messageHistory = [{ role: "user", content: prompt }];
  const availableTools = [{
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
  },
  {
    "type": "function",
    "function": {
      "name": "WriteFile",
      "description": "Write content to a file",
      "parameters": {
        "type": "object",
        "required": ["file_path", "content"],
        "properties": {
          "file_path": {
            "type": "string",
            "description": "The path of the file to write to"
          },
          "content": {
            "type": "string",
            "description": "The content to write to the file"
          }
        }
      }
    }
  }
  ];

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

    console.error("Logs from your program will appear here!");

    if (message.tool_calls && message.tool_calls.length > 0) {
      message.tool_calls.forEach((tool) => {
        /* Identify function */
        const name = tool.function.name;
        const id = tool.id;
        const args = tool.function.arguments;

        if (name == "ReadFile") {
          // Is the read tool
          // Get file path
          const { file_path } = JSON.parse(args);

          const data = readFile(file_path);  // Read file content
          messageHistory.push({
              "role": "tool",
              "tool_call_id": id,
              "content": data
            }
          );
        } else if (name == "WriteFile") {
          const { file_path, content } = JSON.parse(args);

          const msg = writeFile(file_path, content);  // Write file content
          messageHistory.push({
              "role": "tool",
              "tool_call_id": id,
              "content": msg
            }
          );
        }
      });
    } else {
      console.log(message.content); // Display message content for user
      break;
    }
  }
}

function readFile(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return data;
  } catch (error) {
    console.error(error.message);
  }
}

function writeFile(filePath, content) {
  try {
    const dirName = path.dirname(filePath);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return `Successfully wrote to file '${filePath}'`;
  } catch (error) {
    console.error(error.message);
    return "Couldn't create file"
  }
}

main();
