import assert from "node:assert/strict";
import test from "node:test";
import { createVerificationQueue } from "../lib/shop/verification-queue.ts";

test("a purchase waits for the quote and receives a different single-use token", async () => {
  const verify = createVerificationQueue();
  const events = [];
  let token = "quote-token";
  let finishQuote;
  const quoteResponse = new Promise((resolve) => { finishQuote = resolve; });
  const getToken = async () => { events.push(`acquire:${token}`); return token; };
  const reset = () => { events.push("reset"); token = "purchase-token"; };
  const quote = verify(getToken, async (value) => {
    assert.equal(value, "quote-token");
    events.push("quote");
    await quoteResponse;
    return 123;
  }, reset);
  const purchase = verify(getToken, async (value) => {
    assert.equal(value, "purchase-token");
    events.push("purchase");
    return "order";
  }, reset);
  await new Promise(setImmediate);
  assert.deepEqual(events, ["acquire:quote-token", "quote"]);
  finishQuote();
  assert.deepEqual(await Promise.all([quote, purchase]), [123, "order"]);
  assert.deepEqual(events, ["acquire:quote-token", "quote", "reset", "acquire:purchase-token", "purchase", "reset"]);
});

test("a failed request still discards its token and does not block another purchase", async () => {
  const verify = createVerificationQueue();
  let generation = 0;
  const getToken = async () => `token-${generation}`;
  const reset = () => { generation++; };
  await assert.rejects(verify(getToken, async () => { throw new Error("request failed"); }, reset), /request failed/);
  assert.equal(generation, 1);
  assert.equal(await verify(getToken, async (token) => token, reset), "token-1");
  assert.equal(generation, 2);
});

test("a challenge failure sends no request and stays failed until a deliberate retry", async () => {
  const verify = createVerificationQueue();
  let requests = 0;
  let resets = 0;
  await assert.rejects(verify(
    async () => { throw new Error("challenge failed"); },
    async () => { requests++; },
    () => { resets++; },
  ), /challenge failed/);
  assert.equal(requests, 0);
  assert.equal(resets, 0);
  assert.equal(await verify(async () => "fresh", async (token) => token, () => { resets++; }), "fresh");
  assert.equal(resets, 1);
});
