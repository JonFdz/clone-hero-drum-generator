#!/usr/bin/env node
import { printHelp } from "./cliOutput.js";
import { runInspectGpCommand } from "./commands/inspectGpCommand.js";
import { runInspectMidiCommand } from "./commands/inspectMidiCommand.js";
import { runNormalizeDrumsCommand } from "./commands/normalizeDrumsCommand.js";
import { runNormalizeGpDrumsCommand } from "./commands/normalizeGpDrumsCommand.js";
import { runGenerateCommand } from "./commands/generateCommand.js";

let [, , command, ...args] = process.argv;

// Handle pnpm passing through "--" separator
if (command === "--") {
  const next = args.shift();
  if (next !== undefined) {
    command = next;
  }
}

async function main(): Promise<void> {
  try {
    switch (command) {
      case "inspect-midi": {
        await runInspectMidiCommand(args);
        break;
      }

      case "inspect-gp": {
        await runInspectGpCommand(args);
        break;
      }

      case "normalize-drums": {
        await runNormalizeDrumsCommand(args);
        break;
      }

      case "normalize-gp-drums": {
        await runNormalizeGpDrumsCommand(args);
        break;
      }

      case "generate": {
        await runGenerateCommand(args);
        break;
      }

      case "--help":
      case "-h":
      case undefined:
        printHelp();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exitCode = 1;
    }
  } catch (err) {
    const message = (err as Error).message;
    if (message === "ARG_PARSE_ERROR" || message === "HELP_REQUESTED") {
      printHelp();
      if (message === "ARG_PARSE_ERROR") {
        process.exitCode = 1;
      }
    } else {
      console.error(`Error: ${message}`);
      process.exitCode = 1;
    }
  }
}

main();
