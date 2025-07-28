'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Theme } from '../types';
import { THEME } from '../theme';

interface IThemeContext {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<IThemeContext | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState(THEME.dark);

    useEffect(() => {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value as string);
        });
         Object.entries(theme.backgrounds).forEach(([key, value]) => {
            root.style.setProperty(`--bg-${key}`, value as string);
        });
        document.body.style.backgroundColor = theme.backgrounds.main;
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};