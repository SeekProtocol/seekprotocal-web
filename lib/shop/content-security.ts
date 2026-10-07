/** Request-specific script policy; production never permits eval or unnamed inline scripts. */
export function isShopPath(path:string):boolean {
  return /^\/[^/]+\/(?:shop(?:\/|$)|cart-check(?:\/|$)|support-check(?:\/|$))/.test(path);
}
function httpsOrigin(value:string|undefined):string|null {
  try {const url=new URL(value??'');return url.protocol==='https:'?url.origin:null;}catch{return null;}
}
export function shopContentSecurity(nonce:string,shop:boolean,development=false,config:{supabase?:string;solanaRpc?:string}={}):string {
  if(!/^[A-Za-z0-9+/=_-]{20,}$/.test(nonce))throw Error('invalid_nonce');
  const backend=httpsOrigin(config.supabase),rpc=httpsOrigin(config.solanaRpc)??'https://api.mainnet-beta.solana.com';
  const connections=["'self'",'https://challenges.cloudflare.com',rpc,...(backend?[backend,backend.replace('https:','wss:')]:[])];
  if(!shop)connections.push('https://www.google-analytics.com','https://*.google-analytics.com','https://www.googletagmanager.com','https://prod.spline.design','https://*.spline.design');
  if(development)connections.push('ws://localhost:*','ws://127.0.0.1:*');
  return ["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development?" 'unsafe-eval'":''}`,
    "script-src-attr 'none'","style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob: ${backend??''} https://d3e54v103j8qbb.cloudfront.net https://cdn.prod.website-files.com`,
    "font-src 'self' data: https://fonts.gstatic.com",`connect-src ${connections.join(' ')}`,
    `frame-src https://challenges.cloudflare.com${shop?'':' https://iframe.mediadelivery.net https://prod.spline.design'}`,
    "media-src 'self' blob:","object-src 'none'","base-uri 'none'","form-action 'self'","frame-ancestors 'none'","worker-src 'self' blob:",
    ...(development?[]:['upgrade-insecure-requests'])].join('; ');
}

// A fresh document is required when entering/leaving payment pages: client
// navigation retains the previous document's CSP and already running scripts.
export const shopNavigationBoundary = `(function(){var re=/^\\/[^/]+\\/(?:shop(?:\\/|$)|cart-check(?:\\/|$)|support-check(?:\\/|$))/;var initial=re.test(location.pathname);document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;var a=e.target instanceof Element?e.target.closest('a[href]'):null;if(!a||a.target&&a.target!=='_self'||a.hasAttribute('download'))return;var u=new URL(a.href,location.href);if(u.origin===location.origin&&re.test(u.pathname)!==initial){e.preventDefault();e.stopImmediatePropagation();location.assign(u.href);}},true);addEventListener('popstate',function(){if(re.test(location.pathname)!==initial)location.reload();});})();`;
