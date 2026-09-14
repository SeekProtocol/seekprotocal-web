import assert from "node:assert/strict";
import test from "node:test";
import { orderProgress } from "../lib/shop/order-status.ts";

const pending = {status: "pending", paid_at: null, fulfilled_at: null};
test("a pending order is neither paid nor delivered", () => {
  assert.deepEqual(orderProgress(pending), {payment:"pending",delivery:"awaitingPayment"});
});
test("a confirmed payment without credits remains awaiting delivery", () => {
  assert.deepEqual(orderProgress({...pending,status:"paid",paid_at:"2026-09-14T00:00:00Z"}), {payment:"paid",delivery:"processing"});
});
test("late payment evidence survives an expired or failed order status", () => {
  for (const status of ["failed","expired"]) assert.deepEqual(orderProgress({...pending,status,paid_at:"2026-09-14T00:00:00Z"}), {payment:"paid",delivery:"processing"});
});
test("an unpaid closed order does not keep promising delivery", () => {
  for (const status of ["failed","expired"]) assert.deepEqual(orderProgress({...pending,status}), {payment:status,delivery:"notDelivered"});
});
test("only recorded fulfillment marks delivery complete", () => {
  assert.deepEqual(orderProgress({...pending,status:"paid",fulfilled_at:"2026-09-14T00:01:00Z"}), {payment:"paid",delivery:"delivered"});
  assert.deepEqual(orderProgress({...pending,status:"unrecognized"}), {payment:"unknown",delivery:"awaitingPayment"});
});
