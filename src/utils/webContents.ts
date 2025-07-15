let sharedWebContents: any = null;

export const getWebContents = () => {
  return sharedWebContents;
};

export const setWebContents = (webContents: any) => {
  sharedWebContents = webContents;
  return webContents;
};
