import { postApproval } from '../utils/approvals';

async function main() {
    console.log('Testing gs_showrunner approval post...');
    const id = postApproval(
        'Episode 2: The Bergen Betrayal - Outline',
        'BERGEN (40s, gritty) stands on the docks. He looks at the skyline. "I never thought it would come to this."\n\nWHY WE ARE DOING THIS: This outline establishes the central conflict for Season 1, Episode 2, focusing on the loyalty test between Bergen and the Syndicate.',
        'gs_showrunner',
        'creative'
    );
    console.log(`✅ Approval posted with ID: ${id}`);
}

main().catch(console.error);
