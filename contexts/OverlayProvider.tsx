'use client';

import React, { createContext, useState, useMemo } from 'react';
import { OverlayName } from '@/lib/constants';

interface IOverlayContext {
    activeOverlay: OverlayName | null;
    setActiveOverlay: (overlay: OverlayName | null) => void;
}

export const OverlayContext = createContext<IOverlayContext | null>(null);

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeOverlay, setActiveOverlay] = useState<OverlayName | null>(null);

    const value = useMemo(() => ({ activeOverlay, setActiveOverlay }), [activeOverlay]);

    return (
        <OverlayContext.Provider value={value}>
            {children}
        </OverlayContext.Provider>
    );
};
