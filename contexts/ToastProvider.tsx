'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { Toast } from '../types';
import { ToastContext } from './ToastContext';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(currentToasts => [...currentToasts, { id, ...toast }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};