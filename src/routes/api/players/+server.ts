import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';
import { SleeperClient } from '$lib/api/services/SleeperClient';

const DATA_FILE_PATH =
	process.env.NODE_ENV === 'production'
		? path.join('/tmp', 'players.json') // Writable directory in serverless environments
		: path.join(process.cwd(), 'static', 'players.json'); // Local directory for development
export async function GET() {
	try {
		console.log('In server...');
		// Check if the JSON file exists and is up-to-date
		const fileStats = await fs.stat(DATA_FILE_PATH).catch(() => null);

		if (fileStats) {
			const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');

			if (fileData.trim() === '') {
				// File is empty, fetch fresh data
				console.warn('players.json is empty, fetching fresh data...');
			} else {
				try {
					const players = JSON.parse(fileData);

					// Check if the JSON is an empty object
					if (Object.keys(players).length === 0) {
						console.warn('players.json is an empty object, fetching fresh data...');
					} else {
						console.log('Returning players from JSON file...');
						return json(players); // Return the players as JSON
					}
				} catch (error) {
					console.warn('Invalid JSON in players.json, fetching fresh data...');
				}
			}
		}

		// File is outdated, invalid, or doesn't exist, fetch from API
		console.log('Fetching fresh data from Sleeper API...');
		const players = await SleeperClient.GetAllPlayers();
		await fs.writeFile(DATA_FILE_PATH, JSON.stringify(players, null, 2)); // Save to JSON file
		return json(players); // Return the players as JSON
	} catch (error) {
		console.error('Failed to load players:', error);
		return json({ error: 'Failed to load players' }, { status: 500 });
	}
}
