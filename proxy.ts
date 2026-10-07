import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {NextRequest} from 'next/server';
import {isShopPath,shopContentSecurity} from './lib/shop/content-security';

const localize=createMiddleware(routing);
export default function proxy(request:NextRequest) {
  const nonce=Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString('base64');
  const shop=isShopPath(request.nextUrl.pathname);
  const policy=shopContentSecurity(nonce,shop,process.env.NODE_ENV==='development',{
    supabase:process.env.NEXT_PUBLIC_SUPABASE_URL,solanaRpc:process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });
  const headers=new Headers(request.headers);
  // Overwrite client-supplied values; they must never choose their own nonce.
  headers.set('x-nonce',nonce);headers.set('x-shop-page',shop?'1':'0');headers.set('Content-Security-Policy',policy);
  const response=localize(new NextRequest(request,{headers}));
  response.headers.set('Content-Security-Policy',policy);
  response.headers.set('Cache-Control','private, no-store');
  return response;
}

export const config = {
  matcher: ["/", "/(en|nl|de|fr|es|it|pt|pl|sv|fi|et|hu|el|hr|sl|sq|sr-Latn|sr-Cyrl|uk|ru|tr|ar|fa|id|ms|vi|th|zh|zh-TW|ja|ko)/:path*"],
};
