import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/account(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 🔥 ADMIN ROUTES - STRICT ROLE CHECK
  if (isAdminRoute(req)) {
    await auth.protect();
    const { userId } = await auth();
    
    console.log('🔍 [PROXY] Accessing admin route:', req.nextUrl.pathname);
    console.log('🔍 [PROXY] User ID:', userId);
    
    if (!userId) {
      console.log('🚫 [PROXY] No userId found - redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      // ✅ STRICT DATABASE CHECK FOR ADMIN ROLE
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
      
      console.log('🔍 [PROXY] User found in DB:', !!user);
      console.log('🔍 [PROXY] User role:', user?.role);

      // 🔥 DENY ACCESS IF NOT ADMIN
      if (!user) {
        console.log('🚫 [PROXY] User not found in database - redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }

      if (user.role !== 'ADMIN') {
        console.log('🚫 [PROXY] User is', user.role, '- ACCESS DENIED - redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('✅ [PROXY] ADMIN ACCESS GRANTED for user:', userId);
      return NextResponse.next();
    } catch (error) {
      console.error('🚫 [PROXY] Database error:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // PROTECTED ROUTES (non-admin)
  if (isProtectedRoute(req) && !isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
