import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"; // 追加

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhook/clerk(.*)"]);
const isPingRoute = createRouteMatcher(["/api/systems/ping(.*)"]);

// 追加
export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req) || isPingRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
