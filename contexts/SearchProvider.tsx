'use client';

import React, { createContext, useState, useMemo } from 'react';

interface ISearchContext {
    isSearchOpen: boolean;
    searchQuery: string | null;
    executeSearch: (query: string) => void;
    closeSearch: () => void;
}

export const SearchContext = createContext<ISearchContext | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);

    const executeSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearchOpen(true);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery(null);
    };

    const value = useMemo(() => ({
        isSearchOpen,
        searchQuery,
        executeSearch,
        closeSearch,
    }), [isSearchOpen, searchQuery]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};
