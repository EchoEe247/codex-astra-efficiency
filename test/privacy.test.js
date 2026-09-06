import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createTurnMeasurementRecord,
  appendTurnMeasurement,
  readTurnMeasurements
} from "../src/token-usage.js";
import { opaqueKey } from "../src/observe.js";

const ADVERSARIAL_LEAK_SAMPLES = Object.freeze({
  prompt: "CLASSIFIED INSTRUCTION: implement high-frequency arbitrage trading strategy with insider data",
  response: "PROPRIETARY RESPONSE: export function executeArbitrageOrder() { secretAlgorithm(); }",
  cwd: "/home/alice/proprietary-enterprise-monorepo/packages/core",
  repoPath: "https://github.com/secret-corp/core-infra.git",
  accountId: "acct_9876543210_enterprise_tier",
  email: "alice.engineer@secretcorp.internal",
  threadId: "019550b7-f41e-72cb-b5ce-615f0fa4b111",
  turnId: "019550b7-f82a-71dd-9337-33fa0f15c222",
  apiKey: "sk-proj-supersecretopenaiapikey1234567890abcdef",
  accessToken: "ghp_githubpersonalaccesstokensecret999999999"
});

test("Phase 11: Privacy - persisted normalized record contains NONE of adversarial raw values", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cae-privacy-test-"));

  try {
    // Construct record with adversarial payload attempting to inject sensitive values
    const record = createTurnMeasurementRecord({
      sessionKey: ADVERSARIAL_LEAK_SAMPLES.threadId,
      turnKey: ADVERSARIAL_LEAK_SAMPLES.turnId,
      threadId: ADVERSARIAL_LEAK_SAMPLES.threadId,
      turnId: ADVERSARIAL_LEAK_SAMPLES.turnId,
      model: "gpt-6-astra",
      reasoning: "low",
      tokens: {
        inputTokens: 14000,
        cachedInputTokens: 10000,
        outputTokens: 500,
        totalTokens: 14500,
        prompt: ADVERSARIAL_LEAK_SAMPLES.prompt,
        response: ADVERSARIAL_LEAK_SAMPLES.response,
        cwd: ADVERSARIAL_LEAK_SAMPLES.cwd,
        repoPath: ADVERSARIAL_LEAK_SAMPLES.repoPath,
        accountId: ADVERSARIAL_LEAK_SAMPLES.accountId,
        email: ADVERSARIAL_LEAK_SAMPLES.email,
        apiKey: ADVERSARIAL_LEAK_SAMPLES.apiKey,
        accessToken: ADVERSARIAL_LEAK_SAMPLES.accessToken
      },
      outcome: "PASS",
      taskClass: "focused_fix"
    });

    const writtenPath = appendTurnMeasurement(record, tmpDir);
    assert.ok(writtenPath);

    const serializedRecord = JSON.stringify(record);
    const fileContent = fs.readFileSync(writtenPath, "utf8");

    // Test that none of the adversarial raw values leak into serialized record or file
    for (const [fieldName, sensitiveValue] of Object.entries(ADVERSARIAL_LEAK_SAMPLES)) {
      assert.equal(
        serializedRecord.includes(sensitiveValue),
        false,
        `Leak detected in in-memory record for ${fieldName}: ${sensitiveValue}`
      );
      assert.equal(
        fileContent.includes(sensitiveValue),
        false,
        `Leak detected in persisted measurements.jsonl for ${fieldName}: ${sensitiveValue}`
      );
    }

    // Verify stored keys are opaque hashes
    assert.equal(record.sessionKey, opaqueKey("session", ADVERSARIAL_LEAK_SAMPLES.threadId));
    assert.equal(record.turnKey, opaqueKey("turn", ADVERSARIAL_LEAK_SAMPLES.turnId));

    // Confirm that raw native threadId and turnId keys are not present on the record
    assert.equal("threadId" in record, false);
    assert.equal("turnId" in record, false);
    assert.equal("prompt" in record.tokens, false);
    assert.equal("response" in record.tokens, false);
    assert.equal("apiKey" in record.tokens, false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("Phase 11: Privacy - opaque ID hashing is deterministic for correlation and non-reversible", () => {
  const nativeThreadId = "019550b7-f41e-72cb-b5ce-615f0fa4b111";
  const nativeTurnId = "019550b7-f82a-71dd-9337-33fa0f15c222";

  const key1 = opaqueKey("turn", nativeTurnId);
  const key2 = opaqueKey("turn", nativeTurnId);
  assert.equal(key1, key2, "Turn key hashing must be deterministic for correlation");

  const sessionKey = opaqueKey("session", nativeThreadId);
  assert.notEqual(key1, sessionKey, "Different namespaces must yield distinct keys");

  // Non-reversibility: SHA-256 HMAC-equivalent output has fixed 64-char hex form
  assert.match(key1, /^[0-9a-f]{64}$/);
  assert.match(sessionKey, /^[0-9a-f]{64}$/);
  assert.equal(key1.includes(nativeTurnId), false);
  assert.equal(sessionKey.includes(nativeThreadId), false);
});
