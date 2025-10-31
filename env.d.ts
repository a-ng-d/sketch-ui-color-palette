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
    setLayerSettingForKey: (layer: any, key: string, value: any) => any,
  };
}
declare module "sketch/dom" {
  export default {
    StackLayout: any,
    Direction: any,
    AlignItems: any,
    JustifyContent: any,
    Group: any,
    getSelectedDocument: () => any,
    Artboard: any,
    Rectangle: any,
    FlexLayout: any,
    SharedStyle: any,
    FillType: any,
    Style: any,
    FlexSizing: any,
    GroupBehavior: any,
    Text: any,
    ShapePath: any,
    Image: any,
    Sketch: any,
    createLayerFromData: (data: string, type: string) => any,
  }
}
declare module "sketch" {
  export default {
    settingForKey: (key: string) => any,
    Swatch: any,
  };
}
declare module 'mixpanel-browser'
