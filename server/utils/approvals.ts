import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const APPROVALS_PATH = path.join(process.env.HOME || '', '.openclaw', 'approvals.json');

export const postApproval = (title: string, content: string, requester: string, type: string = 'general') => {
    const data = fs.existsSync(APPROVALS_PATH) ? JSON.parse(fs.readFileSync(APPROVALS_PATH, 'utf-8')) : { approvals: [] };
    const newApproval = {
        id: uuidv4(),
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
};
