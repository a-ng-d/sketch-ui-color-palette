import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
import UI from "sketch/ui";
import Settings from "sketch/settings";

const webviewIdentifier = "sketch-ui-color-palette.webview";
let sharedWebContents = null;

export default function () {
  const windowSize = {
    width: parseFloat(
      Settings.globalSettingForKey("plugin_window_width") ?? "640"
    ),
    height: parseFloat(
      Settings.globalSettingForKey("plugin_window_height") ?? "640"
    ),
  };

  const options = {
    identifier: webviewIdentifier,
    width: windowSize.width,
    height: windowSize.height,
    show: false,
  };

  const browserWindow = new BrowserWindow(options);

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
  });

  const webContents = browserWindow.webContents;
  sharedWebContents = webContents;

  // print a message when the page loads
  webContents.on("did-finish-load", () => {
    UI.message("UI loaded!");

    // Canvas > UI
    webContents
      .executeJavaScript(
        `sendData(${JSON.stringify({
          type: "CHECK_USER_AUTHENTICATION",
          data: {
            id: "",
            fullName: "",
            avatar: "",
            accessToken: Settings.globalSettingForKey("supabase_access_token"),
            refreshToken: Settings.globalSettingForKey(
              "supabase_refresh_token"
            ),
          },
        })})`
      )
      .catch(console.error);
    webContents
      .executeJavaScript(
        `sendData(${JSON.stringify({
          type: "SET_THEME",
          data: {
            theme: UI.getTheme() === "light" ? "penpot-light" : "penpot-dark",
          },
        })})`
      )
      .catch(console.error);
    webContents
      .executeJavaScript(
        `sendData(${JSON.stringify({
          type: "CHECK_ANNOUNCEMENTS_VERSION",
        })})`
      )
      .catch(console.error);
  });

  // add a handler for a call from web content's javascript
  webContents.on("nativeLog", (s) => {
    UI.message(s);
  });

  browserWindow.loadURL(require("../resources/webview.html"));
}

export function getWebContents() {
  if (sharedWebContents) {
    return sharedWebContents;
  } else {
    const webview = getWebview(webviewIdentifier);
    if (webview) {
      return webview.webContents;
    } else {
      return null;
    }
  }
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier);
  if (existingWebview) {
    existingWebview.close();
  }
}
