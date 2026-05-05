const fs = require('fs');
const path = require('path');

const APPROVALS_PATH = path.join(process.env.HOME || '', '.openclaw', 'approvals.json');

function postApproval(title, content, requester, type = 'general') {
    const data = fs.existsSync(APPROVALS_PATH) ? JSON.parse(fs.readFileSync(APPROVALS_PATH, 'utf-8')) : { approvals: [] };
    const newApproval = {
        id: 'test-' + Math.random().toString(36).substr(2, 9),
        title,
        content,
        requester,
        type,
        status: 'pending',
        date: new Date().toISOString()
    };
    data.approvals.push(newApproval);
    fs.writeFileSync(APPROVALS_PATH, JSON.stringify(data, null, 2));
    return newApproval.id;
}

console.log('Testing gs_showrunner approval post...');
const id = postApproval(
    'Episode 2: The Bergen Betrayal - Outline',
    'BERGEN (40s, gritty) stands on the docks. He looks at the skyline. "I never thought it would come to this."\n\nWHY WE ARE DOING THIS: This outline establishes the central conflict for Season 1, Episode 2, focusing on the loyalty test between Bergen and the Syndicate.',
    'gs_showrunner',
    'creative'
);
console.log(`✅ Approval posted with ID: ${id}`);
