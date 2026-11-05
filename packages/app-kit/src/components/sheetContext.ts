// True inside an action area: a bottom sheet (content + footer) or a Screen footer. A full-width link there is the
// secondary action under the main one, so it centres itself (user 2026-11-05: "any secondary action below main action is aligned mid").
import { createContext, useContext } from 'react';
export const InSheet = createContext(false);
export const useInSheet = () => useContext(InSheet);
