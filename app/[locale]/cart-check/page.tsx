import type {Metadata} from "next";
import {notFound} from "next/navigation";
import CartPreview from "@/components/shop/CartPreview";
export const metadata: Metadata = {title: "Seekprotocol Shop", robots: {index: false, follow: false}};
export default function CartCheckPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CartPreview/>;
}
