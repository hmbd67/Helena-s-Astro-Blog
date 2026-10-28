import { readdir, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const reports = [
	{
		file: 'eglish-dungannon-illustrative-report.md',
		score: '2-11 to 1-12',
		keyEvent: 'decisive point from a sideline cut',
	},
	{
		file: 'carrickmore-dromore-illustrative-report.md',
		score: '1-14 to 2-10',
		keyEvent: 'three unanswered points',
	},
	{
		file: 'beragh-omagh-illustrative-report.md',
		score: '3-8 to 2-10',
		keyEvent: 'late penalty',
	},
	{
		file: 'dungannon-carrickmore-illustrative-report.md',
		score: '2-9 to 1-11',
		keyEvent: 'goalkeeper denied a close-range effort',
	},
	{
		file: 'dromore-eglish-illustrative-report.md',
		score: '1-13 to 2-9',
		keyEvent: 'forced a turnover',
	},
];

describe('illustrative Tyrone camogie match reports', () => {
	it('contains exactly five reports', async () => {
		const files = await readdir(new URL('.', import.meta.url));
		const reportFiles = files.filter((file) => file.endsWith('-illustrative-report.md'));

		expect(reportFiles.sort()).toEqual(reports.map(({ file }) => file).sort());
	});

	it.each(reports)('$file includes a fictional label, final score, and key event', async (report) => {
		const content = await readFile(new URL(`./${report.file}`, import.meta.url), 'utf8');

		expect(content).toContain('Fictional sample report: this match and result are invented.');
		expect(content).toContain("heroImage: '../../assets/camogie-match.svg'");
		expect(content).toContain(report.score);
		expect(content).toContain(report.keyEvent);
	});
});
