import fs from "node:fs";
import path from "node:path";
import { isAstraModel, loadConfig } from "./config.js";
import { safeObservation } from "./observe.js";

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
  const targeted = isAstraModel(input.model, config.astraModelIds);

  if (!targeted) {
    return {
      response: NOOP_RESPONSE,
      targeted: false,
      observation: null,
      config
    };
  }

  const observation = safeObservation(input, options.observedAt);
  return {
    response: NOOP_RESPONSE,
    targeted: true,
    observation,
    config
  };
}

export function appendObservation(observation, dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, "events.jsonl");
  fs.appendFileSync(file, `${JSON.stringify(observation)}\n`, {
    encoding: "utf8",
    mode: 0o600
  });
  return file;
}

export function runHook(raw, options = {}) {
  const input = parseHookInput(raw);
  const result = processHookInput(input, options);

  if (result.targeted && result.observation) {
    appendObservation(result.observation, result.config.dir);
  }

  return result.response;
}
