import { describe, expect, it } from 'vitest';
import { leagueTable } from './leagueTable';

describe('Tyrone Senior Camogie league table data', () => {
	it('includes the expected teams and all requested statistics', () => {
		expect(leagueTable).toEqual([
			{ team: 'Eglish', points: 8, wins: 4, draws: 0, losses: 1, scoreDifference: 18 },
			{ team: 'Carrickmore', points: 8, wins: 4, draws: 0, losses: 1, scoreDifference: 12 },
			{ team: 'Dromore', points: 6, wins: 3, draws: 0, losses: 2, scoreDifference: 7 },
			{ team: 'Beragh', points: 5, wins: 2, draws: 1, losses: 2, scoreDifference: 4 },
			{ team: 'Dungannon', points: 3, wins: 1, draws: 1, losses: 3, scoreDifference: -8 },
			{ team: 'Omagh', points: 0, wins: 0, draws: 0, losses: 5, scoreDifference: -33 },
		]);
	});

	it('awards two points per win and one per draw, with five matches played by each team', () => {
		for (const { points, wins, draws, losses } of leagueTable) {
			expect(points).toBe(wins * 2 + draws);
			expect(wins + draws + losses).toBe(5);
		}
	});

	it('orders teams by league points, then score difference', () => {
		for (let index = 1; index < leagueTable.length; index += 1) {
			const previous = leagueTable[index - 1];
			const current = leagueTable[index];

			expect(
				previous.points > current.points ||
					(previous.points === current.points &&
						previous.scoreDifference >= current.scoreDifference),
			).toBe(true);
		}
	});
});
