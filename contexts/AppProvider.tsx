'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ToastProvider } from './ToastProvider';
import { Toaster } from '@/components/ui/Toaster';
import { ThemeProvider } from './ThemeProvider';
import { OverlayProvider } from './OverlayProvider';
import { SearchProvider } from './SearchProvider';
import { UserProvider } from './UserContext';
import AppLayout from '@/components/layout/AppLayout';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    
    return (
        <ToastProvider>
            <ThemeProvider>
                <UserProvider>
                    <OverlayProvider>
                        <SearchProvider>
                            {isLoginPage ? (
                                children
                            ) : (
                                <AppLayout>
                                    {children}
                                </AppLayout>
                            )}
                        </SearchProvider>
                    </OverlayProvider>
                </UserProvider>
            </ThemeProvider>
            <Toaster />
        </ToastProvider>
    );
};
