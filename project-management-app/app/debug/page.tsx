'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        testConnection()
    }, [])

    async function testConnection() {
        const results: any = {}

        // Test environment variables
        results.envVars = {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
            keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
        }

        // Test project table
        try {
            const { data, error, count } = await supabase
                .from('project')
                .select('*', { count: 'exact' })

            results.projectTable = {
                success: !error,
                error: error?.message || null,
                count: count,
                sampleData: data?.slice(0, 2) || []
            }
        } catch (err: any) {
            results.projectTable = {
                success: false,
                error: err.message,
                count: 0
            }
        }

        // Test appuser table
        try {
            const { data, error, count } = await supabase
                .from('appuser')
                .select('*', { count: 'exact' })

            results.appuserTable = {
                success: !error,
                error: error?.message || null,
                count: count,
                sampleData: data?.slice(0, 2) || []
            }
        } catch (err: any) {
            results.appuserTable = {
                success: false,
                error: err.message,
                count: 0
            }
        }

        setDebugInfo(results)
        setLoading(false)
    }

    if (loading) {
        return <div style={{ padding: '2rem' }}>Testing connection...</div>
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1 style={{ marginBottom: '2rem' }}>Database Connection Debug</h1>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Environment Variables</h2>
                <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                    {JSON.stringify(debugInfo.envVars, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Project Table</h2>
                <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                    {JSON.stringify(debugInfo.projectTable, null, 2)}
                </pre>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2>AppUser Table</h2>
                <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                    {JSON.stringify(debugInfo.appuserTable, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
                <h3>Common Issues:</h3>
                <ol>
                    <li><strong>RLS (Row Level Security):</strong> Make sure RLS policies are disabled or configured correctly in Supabase</li>
                    <li><strong>Table Names:</strong> Tables might be case-sensitive (try "Project" instead of "project")</li>
                    <li><strong>API Key:</strong> Ensure you're using the correct anon/public key from Supabase</li>
                    <li><strong>Column Names:</strong> Check that column names match exactly (case-sensitive)</li>
                </ol>
            </div>

            <button
                onClick={testConnection}
                style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                Retest Connection
            </button>
        </div>
    )
}
