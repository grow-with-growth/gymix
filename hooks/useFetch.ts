'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';

interface UseFetchResponse<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useFetch<T>(url: string | null): UseFetchResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        if (!url) {
            setData(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({}));
                throw new Error(errorBody.error || `Failed to fetch data: ${res.status} ${res.statusText}`);
            }
            const json = await res.json();
            setData(json);
        } catch (e) {
            const err = e instanceof Error ? e : new Error('An unknown error occurred');
            setError(err);
            console.error(`useFetch Error at ${url}:`, err);
            toast({
                type: 'error',
                title: 'Network Error',
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [url, toast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}
