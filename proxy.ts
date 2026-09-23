import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|nl|de|fr|es|it|pt|pl|sv|fi|et|hu|el|hr|sl|sq|sr-Latn|sr-Cyrl|uk|ru|tr|ar|fa|id|ms|vi|th|zh|zh-TW|ja|ko)/:path*"],
};
