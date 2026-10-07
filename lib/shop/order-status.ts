export interface OrderState {
  status: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  payment_protocol?:string|null;
  payment_finalized_through?:string|null;
  expires_at?:string;
}

/** Expiring a quote says nothing about a transfer still awaiting chain finality. */
export function awaitsEvmFinality(order:OrderState) {
  if(order.payment_protocol!=='evm-native-v1'||order.paid_at||order.fulfilled_at||order.status==='paid')return false;
  const through=Date.parse(order.payment_finalized_through??''),expires=Date.parse(order.expires_at??'');
  return !Number.isFinite(through)||!Number.isFinite(expires)||through<expires+120_000;
}

/** Payment and delivery are independent server facts, never inferred from a return URL. */
export function orderProgress(order: OrderState) {
  const paid = !!order.paid_at || order.status === "paid";
  const payment = paid ? "paid" : order.status === "pending" || order.status === "expired" && awaitsEvmFinality(order) ? "pending"
    : order.status === "expired" ? "expired" : order.status === "failed" ? "failed" : "unknown";
  const delivery = order.fulfilled_at ? "delivered" : paid ? "processing"
    : payment === "expired" || payment === "failed" ? "notDelivered" : "awaitingPayment";
  return {payment, delivery} as const;
}
