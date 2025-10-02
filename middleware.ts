// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/bookings(.*)",
//   "/checkout(.*)",
//   "/favorites(.*)",
//   "/reservations(.*)",
//   "/reviews(.*)",
// ]);

// const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// export default clerkMiddleware((auth, req) => {
//   const isAdminUser = auth().userId === process.env.ADMIN_USER_ID;
//   if (isAdminRoute(req) && !isAdminUser) {
//     //  middleware.ts 専用の サーバーサイドリダイレクト
//     return NextResponse.redirect(new URL("/", req.url));
//   }
//   if (isProtectedRoute(req)) auth().protect();
// });

// export const config = {
//   runtime: "nodejs",
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

export const config = {
  runtime: "nodejs",
  matcher: [
    "/bookings(.*)",
    "/checkout(.*)",
    "/favorites(.*)",
    "/reservations(.*)",
    "/reviews(.*)",
    "/admin(.*)",
  ],
};
