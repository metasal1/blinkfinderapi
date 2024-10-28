import express from 'express';
import { getRegistryStats } from './api/registry';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/registry', async (req, res) => {
    try {
        const stats = await getRegistryStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch registry data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
