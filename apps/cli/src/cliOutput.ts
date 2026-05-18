import type { NoteStats } from "@chdg/midi";

export function printHelp(): void {
	console.log(`CHDG - Clone Hero Drum Generator

Usage:
  chdg inspect [options] <file.mid|file.gp>
  chdg inspect-midi [options] <file.mid>
  chdg inspect-gp [options] <file.gp>
  chdg normalize-drums [options] <file.mid>
  chdg normalize-gp-drums [options] <file.gp> --track <index>
  chdg generate [options] <file.mid|file.gp> --out <output-dir>

Options:
  --track <index>          Select a specific track (for generate, inspect-midi, normalize-drums, normalize-gp-drums)
  --drums-only             Show only strong drum tracks
  --out <dir>              Output directory for generate command
  --audio <file>           Final audio filename for song.ini (default: song.ogg)
  --audio-source <path>    Source audio file to copy/convert into the output directory
  --name <name>            Song name for generated metadata
  --artist <artist>        Artist for generated metadata
  --album <album>          Album for generated metadata
  --year <year>            Year for generated metadata
  --genre <genre>          Genre for generated metadata
  --charter <charter>      Charter for generated metadata
  --offset-ms <number>     Chart offset in milliseconds; writes seconds to notes.chart Offset
  --json                   Emit machine-readable JSON only on stdout
  --help                   Show this help
`);
}

export function formatNumber(n: number, decimals = 1): string {
	return n.toFixed(decimals);
}

export function printNoteStats(noteStats: Record<number, NoteStats>): void {
	console.log("  Note | Count | Avg Vel | Guessed Piece");
	console.log("  -----|-------|---------|---------------");
	const noteNumbers = Object.keys(noteStats)
		.map(Number)
		.sort((a, b) => a - b);
	for (const note of noteNumbers) {
		const stat = noteStats[note];
		const pieceStr =
			stat.guessedPiece === "unknown" ? "UNKNOWN" : stat.guessedPiece;
		console.log(
			`  ${String(note).padEnd(4)} | ${String(stat.count).padEnd(5)} | ${formatNumber(stat.avgVelocity).padEnd(7)} | ${pieceStr}`,
		);
	}
}

export function printUnknownNotes(label: string, unknownNotes: number[]): void {
	if (unknownNotes.length > 0) {
		console.log(`Unknown Notes (${label}): ${unknownNotes.join(", ")}`);
	} else {
		console.log(`Unknown Notes (${label}): none`);
	}
}
