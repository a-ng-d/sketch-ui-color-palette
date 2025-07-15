declare module '*.webp' {
  const value: string
  export = value
}
declare module '*.gif' {
  const value: string
  export = value
}
declare module '*.json' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any
  export default value
}
declare module 'jszip'
declare module 'react-dom/client'
declare module 'apca-w3'
declare module 'sketch/settings' {
  export default {
    settingForKey: (key: string) => any,
    setSettingForKey: (key: string, value: any) => any,
    documentSettingForKey: (document: any, key: string) => any,
    setDocumentSettingForKey: (document: any, key: string, value: any) => any,
    layerSettingForKey: (layer: any, key: string) => any,
    setLayerSettingForKey: (layer: any, key: string, value: void) => any,
  };
}
declare module 'sketch/dom' {
  export default {
    getSelectedDocument: () => any,
  }
}
