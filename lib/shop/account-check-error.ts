/** Account lookup failures must retain their actual reason in customer-facing copy. */
export function accountCheckError(code: string): {scope:'shop'|'checkout';key:string} {
  switch (code) {
    case 'friends_id_invalid': return {scope:'checkout',key:'invalidFriend'};
    case 'arena_unavailable': return {scope:'checkout',key:'recipientUnavailable'};
    case 'unauthorized': return {scope:'shop',key:'errUnauthorized'};
    case 'rate_limited': return {scope:'shop',key:'errRateLimited'};
    case 'account_blocked': return {scope:'shop',key:'errAccountBlocked'};
    case 'app_account_required': return {scope:'shop',key:'login.appRequired'};
    case 'catalog_changed': return {scope:'shop',key:'errCatalogChanged'};
    case 'invalid_cart': return {scope:'shop',key:'errCart'};
    case 'network': return {scope:'shop',key:'errNetwork'};
    case 'checkout_unavailable': return {scope:'shop',key:'errCheckoutUnavailable'};
    default: return {scope:'checkout',key:'detailsFailed'};
  }
}
