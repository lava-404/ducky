// sdk/types.ts

export interface YieldConfig {
  projectId: string;
  apiBaseUrl?: string; // default to your backend
}

export interface YieldButtonProps {
  dodoPriceId: string;
  children: React.ReactNode;
  className?: string;
}