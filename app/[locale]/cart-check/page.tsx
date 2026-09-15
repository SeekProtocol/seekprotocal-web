import {notFound} from "next/navigation";
import CartPreview from "@/components/shop/CartPreview";
export default function CartCheckPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CartPreview/>;
}
