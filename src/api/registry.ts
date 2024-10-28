import axios from 'axios';

interface RegistryAction {
    actionUrl: string;
    blinkUrl: string | null;
    websiteUrl: string | null;
    createdAt: string;
    tags: string[];
    actionData?: any; // To store the response from actionUrl
}

interface RegistryResponse {
    results: RegistryAction[];
}

interface ProcessedRegistry {
    totalActions: number;
    actionsWithBlinkUrl: number;
    actionsWithWebsiteUrl: number;
    actionsWithTags: number;
    registeredActions: number;
    maliciousActions: number;
    results: RegistryAction[];
    timeTaken: number;
}

async function fetchActionData(actionUrl: string) {
    try {
        const response = await axios.get(actionUrl, { timeout: 5000 });
        return response.data;
    } catch (error) {
        return null; // Return null if the fetch fails
    }
}

export async function getRegistryStats(): Promise<ProcessedRegistry> {
    const startTime = Date.now();

    try {
        const response = await axios.get<RegistryResponse>('https://registry.dial.to/v1/list');
        const actions = response.data.results;

        // Fetch action data for each result
        const enrichedActions = await Promise.all(
            actions.map(async (action) => {
                const actionData = await fetchActionData(action.actionUrl);
                return {
                    ...action,
                    actionData
                };
            })
        );

        const stats = {
            totalActions: actions.length,
            actionsWithBlinkUrl: actions.filter(action => action.blinkUrl !== null).length,
            actionsWithWebsiteUrl: actions.filter(action => action.websiteUrl !== null).length,
            actionsWithTags: actions.filter(action => action.tags.length > 0).length,
            registeredActions: actions.filter(action => action.tags.includes('registered')).length,
            maliciousActions: actions.filter(action => action.tags.includes('malicious')).length,
            results: enrichedActions,
            timeTaken: Date.now() - startTime
        };

        return stats;

    } catch (error) {
        throw new Error('Failed to fetch registry data');
    }
}
