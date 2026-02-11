import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Tools have a fixed directory */
/*      ./tools        */
const directory = path.join(__dirname, "tools");
/* Change it here if you move the directory */

export default async function bundleTools() {
    const funcs = {};
    const tools = [];

    const files = fs.readdirSync(directory).filter(file => file.endsWith('.js'));

    for (const file of files) {
        const filePath = path.join(directory, file);
        
        // Dynamically import the file
        const toolModule = await import(`file://${path.resolve(filePath)}`);

        const { tool, run } = toolModule.default || toolModule;

        if (tool && tool.function && run) {
            // Create lookup
            funcs[tool.function.name] = run;
            
            // Collect tool specification
            tools.push(tool);
        }
    }

    return {
        availableTools: tools, 
        runLookup: funcs
    }
}