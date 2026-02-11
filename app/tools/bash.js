import { execSync } from "child_process";

export const tool = {
    "type": "function",
    "function": {
      "name": "Bash",
      "description": "Execute a shell command",
      "parameters": {
        "type": "object",
        "required": ["command"],
        "properties": {
          "command": {
            "type": "string",
            "description": "The command to execute"
          }
        }
      }
    }
  };

export function run(args) {
  try {
    const command = args.command;
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    console.error(error.message);
    return "Couldn't run command";
  }
}