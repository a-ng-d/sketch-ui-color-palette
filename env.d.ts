/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const sketchSettings: any
  export default sketchSettings
}

declare module 'sketch/dom' {
  const sketchDom: any
  export default sketchDom
}
declare module 'sketch' {
  const sketch: any
  export default sketch
}
declare module 'mixpanel-browser'
