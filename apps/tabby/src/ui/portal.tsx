// Native: no DOM; children render in place. Web version: portal.web.tsx.
import React from 'react';
export function BodyPortal({ children }: { children: React.ReactNode }) { return <>{children}</>; }
