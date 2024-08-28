import { v4 as uuidv4 } from 'uuid';

export const getUniqueId = (prefix: string) => `${prefix}-${uuidv4()}`;
