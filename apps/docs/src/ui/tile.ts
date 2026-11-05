import { createContext } from 'react';
/** True inside a gallery tile: the story decorator then renders one small copy (toolbar theme), not the light + dark pair. */
export const TileCtx = createContext(false);
