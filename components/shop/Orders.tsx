"use client";

import ShopAccount from "./ShopAccount";
import OrderHistory from "./OrderHistory";

export default function Orders() {
  return <ShopAccount page="orders">{session => <OrderHistory key={session.user.id} userId={session.user.id} />}</ShopAccount>;
}
