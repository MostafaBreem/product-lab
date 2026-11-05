// True inside a BottomSheet (content + footer). Lets a full-width link under the main action centre itself (user 2026-11-05).
import { createContext, useContext } from 'react';
export const InSheet = createContext(false);
export const useInSheet = () => useContext(InSheet);
