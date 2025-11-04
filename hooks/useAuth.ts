// Fix: Removed unused imports. The `AuthContext` import was causing an error because it's not exported.
// The imports are not needed as this file just re-exports the hook.

// This is just a re-export for convenience. 
// The actual implementation is in AuthContext.tsx to avoid circular dependencies.
export { useAuth } from '../contexts/AuthContext';
