import fs from "fs";
import path from "path";

export const tool =  {
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
  };

export function run(args) {
  try {
    const { file_path, content } = args;
    const dirName = path.dirname(file_path);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
    fs.writeFileSync(file_path, content, 'utf-8');
    return `Successfully wrote to file '${file_path}'`;
  } catch (error) {
    console.error(error.message);
    return "Couldn't create file"
  }
}