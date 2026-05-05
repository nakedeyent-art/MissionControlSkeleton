const fs = require('fs');
const content = fs.readFileSync('/Users/rizzolini/Gemini/antigravity/scratch/Agent HQ/MissionControlHub/server/index.ts', 'utf8');
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
    }
    if (depth < 0) {
        console.log(`Unbalanced at line ${i + 1}: depth ${depth}`);
        process.exit(0);
    }
}
console.log(`Final depth: ${depth}`);
