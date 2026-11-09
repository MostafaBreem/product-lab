// Native: no DOM; children render in place. Web version: portal.web.tsx. (Moved from apps/tabby 2026-11-09.)
import React from 'react';
export function BodyPortal({ children }: { children: React.ReactNode }) { return <>{children}</>; }
