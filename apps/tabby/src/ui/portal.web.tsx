// Web: render above every Modal (sheets), which react-native-web appends to <body> (user 2026-11-05: Comment did not work on sheets).
import type React from 'react';
import { createPortal } from 'react-dom';
export function BodyPortal({ children }: { children: React.ReactNode }) { return createPortal(children, document.body); }
