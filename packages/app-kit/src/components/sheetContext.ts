// True inside an action area: a bottom sheet (content + footer) or a Screen footer. A full-width link there is the
// secondary action under the main one, so it centres itself (user 2026-11-05: "any secondary action below main action is aligned mid").
import { createContext, useContext } from 'react';
export const InSheet = createContext(false);
export const useInSheet = () => useContext(InSheet);
// True only in an action area: a BottomSheet footer or a Screen footer (not sheet content, not inside a Notice).
// A link there is the secondary action directly below the main one: centred by default (decisions/system.md 2026-11-05).
export const InActions = createContext(false);
export const useInActions = () => useContext(InActions);
