import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { UserProvider } from '@/context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Project Management System',
    description: 'Comprehensive project management and tracking system',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <UserProvider>
                    <Navigation />
                    <main style={{ minHeight: 'calc(100vh - 70px)' }}>
                        {children}
                    </main>
                </UserProvider>
            </body>
        </html>
    )
}
