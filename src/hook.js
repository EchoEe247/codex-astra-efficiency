import fs from "node:fs";
import path from "node:path";
import { isAstraModel, loadConfig } from "./config.js";
import { safeObservation } from "./observe.js";
import {
  appendTurnMeasurement,
  createTurnMeasurementRecord,
  readTokenUsageFromTranscript
} from "./token-usage.js";

export const NOOP_RESPONSE = Object.freeze({ continue: true, suppressOutput: true });

export function parseHookInput(raw) {
  const value = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("hook input must be a JSON object");
  }
  return value;
}

export function processHookInput(input, options = {}) {
  const config = options.config ?? loadConfig(options.env ?? process.env);
  const targeted = isAstraModel(input?.model, config.astraModelIds);

  if (!targeted) {
    return {
      targeted: false,
      observation: null,
      response: NOOP_RESPONSE,
      config
    };
  }

  const observation = safeObservation(input, options.observedAt);
  return {
    targeted: true,
    observation,
    response: NOOP_RESPONSE,
    config
  };
}

export function appendObservation(observation, dir) {
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    if (process.platform !== "win32") {
      try {
        const dirStat = fs.statSync(dir);
        if ((dirStat.mode & 0o077) !== 0) {
          fs.chmodSync(dir, 0o700);
        }
      } catch {}
    }
    const file = path.join(dir, "events.jsonl");
    fs.appendFileSync(file, `${JSON.stringify(observation)}\n`, {
      encoding: "utf8",
      mode: 0o600
    });
    if (process.platform !== "win32") {
      try {
        const fileStat = fs.statSync(file);
        if ((fileStat.mode & 0o077) !== 0) {
          fs.chmodSync(file, 0o600);
        }
      } catch {}
    }
    return file;
  } catch {
    return null;
  }
}

export function runHook(raw, options = {}) {
  const input = parseHookInput(raw);
  const result = processHookInput(input, options);

  if (result.targeted && result.observation) {
    appendObservation(result.observation, result.config.dir);

    if (input?.hook_event_name === "Stop" && typeof input?.transcript_path === "string") {
      try {
        const rawUsage = readTokenUsageFromTranscript(input.transcript_path, options);
        if (rawUsage) {
          const measurement = createTurnMeasurementRecord({
            sessionKey: result.observation.sessionKey,
            turnKey: result.observation.turnKey,
            model: result.observation.model,
            tokenUsage: rawUsage
          });
          if (measurement) {
            appendTurnMeasurement(measurement, result.config.dir);
          }
        }
      } catch {
        // fail-open
      }
    }
  }

  return result.response;
}
