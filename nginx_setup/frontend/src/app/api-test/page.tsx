// Api Test Page

"use client";

import React, { useState } from "react";


interface ApiResponse {
    message: string;
    serverId: string;
    timestamp: string;
}


export default function ApiTest() {
    const [responses, setResponses] = useState<ApiResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const fetchApi = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/hello');
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`)
            }
            const data = await response.json();
            setResponses(prev => [data, ...prev].slice(0, 10));
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occured");
        } finally {
            setLoading(false)
        }
    };

    const clearResponses = () => {
        setResponses([]);
    };

    // Test Load Balancing
    const testLoadBalancing = async () => {
        setLoading(true);
        for (let i = 0; i < 5; i++) {
            await fetchApi();

            await new Promise(resolve => setTimeout(resolve, 100));
        }
        setLoading(false);
    }

    return (
        <main>
            <h1>API Testing Page</h1>
            <p>This page demonstrates Nginx reverse proxying and load balancing.</p>

            <div>
                <button onClick={fetchApi} disabled={loading}>
                    Make API Request
                </button>
                <button onClick={testLoadBalancing} disabled={loading}>
                    Test Load Balancing (5 requests)
                </button>
                <button onClick={clearResponses}>
                    Clear Results
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {responses.length > 0 && (
                <div>
                    <h2>API Responses:</h2>
                    {responses.map((response, index) => (
                        <pre key={index}>
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    ))}
                </div>
            )}
        </main>
    )
}

