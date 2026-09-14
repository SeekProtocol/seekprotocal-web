export interface OrderState {
  status: string;
  paid_at: string | null;
  fulfilled_at: string | null;
}

/** Payment and delivery are independent server facts, never inferred from a return URL. */
export function orderProgress(order: OrderState) {
  const paid = !!order.paid_at || order.status === "paid";
  const payment = paid ? "paid" : order.status === "pending" ? "pending"
    : order.status === "expired" ? "expired" : order.status === "failed" ? "failed" : "unknown";
  const delivery = order.fulfilled_at ? "delivered" : paid ? "processing"
    : payment === "expired" || payment === "failed" ? "notDelivered" : "awaitingPayment";
  return {payment, delivery} as const;
}
