export const CAE_HOOK_COMMAND = "cae hook --cae-owned";
export const CAE_HOOK_EVENTS = Object.freeze(["UserPromptSubmit", "Stop"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a JSON object`);
  }
}

export function parseHooksConfig(raw) {
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  ensureObject(parsed, "hooks config");
  if (parsed.hooks !== undefined) ensureObject(parsed.hooks, "hooks");
  return parsed;
}

function isCaeHandler(handler, command = CAE_HOOK_COMMAND) {
  return Boolean(
    handler &&
      typeof handler === "object" &&
      !Array.isArray(handler) &&
      handler.type === "command" &&
      handler.command === command
  );
}

export function installCaeHooks(config, command = CAE_HOOK_COMMAND) {
  ensureObject(config, "hooks config");
  const next = clone(config);
  next.hooks ??= {};
  ensureObject(next.hooks, "hooks");

  for (const eventName of CAE_HOOK_EVENTS) {
    const groups = next.hooks[eventName] ?? [];
    if (!Array.isArray(groups)) {
      throw new TypeError(`hooks.${eventName} must be an array`);
    }

    const alreadyInstalled = groups.some(
      (group) =>
        group &&
        typeof group === "object" &&
        Array.isArray(group.hooks) &&
        group.hooks.some((handler) => isCaeHandler(handler, command))
    );

    if (!alreadyInstalled) {
      groups.push({ hooks: [{ type: "command", command }] });
    }
    next.hooks[eventName] = groups;
  }

  return next;
}

export function uninstallCaeHooks(config, command = CAE_HOOK_COMMAND) {
  ensureObject(config, "hooks config");
  const next = clone(config);
  if (!next.hooks) return next;
  ensureObject(next.hooks, "hooks");

  for (const eventName of CAE_HOOK_EVENTS) {
    const groups = next.hooks[eventName];
    if (groups === undefined) continue;
    if (!Array.isArray(groups)) {
      throw new TypeError(`hooks.${eventName} must be an array`);
    }

    const cleaned = [];
    for (const group of groups) {
      if (!group || typeof group !== "object" || Array.isArray(group)) {
        cleaned.push(group);
        continue;
      }
      if (!Array.isArray(group.hooks)) {
        cleaned.push(group);
        continue;
      }

      const remainingHandlers = group.hooks.filter(
        (handler) => !isCaeHandler(handler, command)
      );
      if (remainingHandlers.length > 0) {
        cleaned.push({ ...group, hooks: remainingHandlers });
      }
    }

    if (cleaned.length > 0) next.hooks[eventName] = cleaned;
    else delete next.hooks[eventName];
  }

  return next;
}
