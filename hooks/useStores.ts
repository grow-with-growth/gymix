import { useUserStore, userSelectors } from '../stores/userStore';
import { useApplicationStore, applicationSelectors } from '../stores/applicationStore';

// Combined hook for accessing all stores
export const useStores = () => {
  const userStore = useUserStore();
  const applicationStore = useApplicationStore();
  
  return {
    user: userStore,
    application: applicationStore,
  };
};

// Hook for accessing selectors
export const useSelectors = () => {
  return {
    user: userSelectors,
    application: applicationSelectors,
  };
};

// Individual store hooks for convenience
export const useUser = () => useUserStore();
export const useApplication = () => useApplicationStore();