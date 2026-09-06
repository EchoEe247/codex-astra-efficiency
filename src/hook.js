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
    throw new Error("Invalid hook input: expected JSON object");
  }
  return value;
}

export function processHookInput(input, options = {}) {
  const config = options.config ?? loadConfig();
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
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "events.jsonl");
  fs.appendFileSync(file, `${JSON.stringify(observation)}\n`, "utf8");
}

export function runHook(raw, options = {}) {
  const input = parseHookInput(raw);
  const result = processHookInput(input, options);

  if (result.targeted && result.observation) {
    appendObservation(result.observation, result.config.dir);

    if (input?.hook_event_name === "Stop" && typeof input?.transcript_path === "string") {
      try {
        const rawUsage = readTokenUsageFromTranscript(input.transcript_path);
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
