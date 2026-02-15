'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AppUser } from '@/types/database'

interface UserContextType {
    currentUser: AppUser | null
    setCurrentUser: (user: AppUser | null) => void
    allUsers: AppUser[]
    loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
    const [allUsers, setAllUsers] = useState<AppUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    // Load selected user from local storage on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('project_app_current_user_email')
        if (storedEmail && allUsers.length > 0) {
            const user = allUsers.find(u => u.email === storedEmail)
            if (user) setCurrentUser(user)
        }
    }, [allUsers])

    // Save selected user to local storage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('project_app_current_user_email', currentUser.email)
        } else {
            localStorage.removeItem('project_app_current_user_email')
        }
    }, [currentUser])

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('appuser')
                .select('*')
                .eq('isactive', true)
                .order('firstname')

            if (error) throw error
            setAllUsers(data || [])

            // If no user selected and we have users, select the first one by default
            if (!currentUser && data && data.length > 0 && !localStorage.getItem('project_app_current_user_email')) {
                setCurrentUser(data[0])
            }

        } catch (error) {
            console.error('Error fetching users for context:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, allUsers, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
