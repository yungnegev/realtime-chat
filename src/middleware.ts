import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'


export default withAuth(
    async function middleware(req, res) {
        // get the path
        const pathname = req.nextUrl.pathname

        // manage the route protection
        // this is how it's done using next-auth
        const isAuth = await getToken({ req })
        const isOnLoginPage = pathname.startsWith('/login')
        // our sensitive routes
        const sensitiveRoutes = ['/dashboard']
        // for all the sensitive routes we have
        const isAccessingSensitiveRoute = sensitiveRoutes.some((route) => pathname.startsWith(route))

        // making sure that the user is not able to get to the login page while being already authenticated
        if (isOnLoginPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url)) // req.url just means whatever the current url us wheter it is localhost or hosted
            }
            return NextResponse.next() // pass along the request
        }

        // not authed and trying to access a sensitive route
        if (!isAuth && isAccessingSensitiveRoute) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        // considering this app does not have a home '/' page and works from the /dashbooard, we need to redirect from home to dashboard
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        
    },
    {
        callbacks: {
            async authorized() {
                return true
            }
        }
    }
)

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*']
}