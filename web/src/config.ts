const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
export const wsServer =
  import.meta.env.VITE_WS_SERVER || `${wsProtocol}${window.location.host}/ws`;
export const defaultAppName: string =
  import.meta.env.VITE_APP_NAME || 'FileDrop';
export const nameCharacterSet = 'CEFGHJKMNPQRTVWXY';
export const nameLength = 5;
