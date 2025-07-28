import { createContext } from 'react';
import { Toast } from '../types';

export type AddToastFunction = (toast: Omit<Toast, 'id'>) => void;

export interface ToastContextType {
    toasts: Toast[];
    addToast: AddToastFunction;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
    toasts: [],
    addToast: () => {
        throw new Error('addToast function must be used within a ToastProvider');
    },
    removeToast: () => {
        throw new Error('removeToast function must be used within a ToastProvider');
    },
});