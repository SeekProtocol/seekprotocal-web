/** Keep only a server-owned order reference across a fresh sign-in. It never
 * proves payment or ownership: checkout still asks the authenticated API. */
export function shopReturnPath(pathname: string, search: string): string {
  const params=new URLSearchParams(search);
  for(const key of ['order','reorder']) {
    const order=params.get(key);
    if(order && /^[A-Za-z0-9_-]{8,64}$/.test(order)) return `${pathname}?${key}=${encodeURIComponent(order)}`;
  }
  return pathname;
}
