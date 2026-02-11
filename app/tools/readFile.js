import fs from "fs";

export const tool = {
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
  };

export function run(args) {
    try {
        const filePath = args.file_path;
        const data = fs.readFileSync(filePath, 'utf-8');
        return data;
    } catch (error) {
        console.error(error.message);
        return "Couldn't read file";
    }
}