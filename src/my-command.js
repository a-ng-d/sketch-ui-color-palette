import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
import UI from "sketch/ui";
import Settings from "sketch/settings";
import checkUserConsent from "./bridges/checks/checkUserConsent";
import checkTrialStatus from "./bridges/checks/checkTrialStatus";
import checkUserLicense from "./bridges/checks/checkUserLicense";
import checkUserPreferences from "./bridges/checks/checkUserPreferences";
import checkAnnouncementsStatus from "./bridges/checks/checkAnnouncementsStatus";
import getPalettesOnCurrentPage from "./bridges/getPalettesOnCurrentPage";
import processSelection from "./bridges/processSelection.ts";
import { setWebContents } from "./utils/webContents";
import { locales } from "../resources/content/locales";

const webviewIdentifier = "sketch-ui-color-palette.webview";

export default function () {
  const windowSize = {
    width: parseFloat(Settings.settingForKey("plugin_window_width") ?? "640"),
    height: parseFloat(Settings.settingForKey("plugin_window_height") ?? "640"),
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
  setWebContents(webContents);

  // print a message when the page loads
  webContents.on("did-finish-load", () => {
    UI.message("UI loaded!");

    // Canvas > UI
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_USER_AUTHENTICATION",
        data: {
          id: "",
          fullName: "",
          avatar: "",
          accessToken: Settings.settingForKey("supabase_access_token"),
          refreshToken: Settings.settingForKey("supabase_refresh_token"),
        },
      })})`
    );
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "SET_THEME",
        data: {
          theme: UI.getTheme() === "light" ? "penpot-light" : "penpot-dark",
        },
      })})`
    );
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_ANNOUNCEMENTS_VERSION",
      })})`
    );

    // Checks
    checkUserConsent()
      .then(() => checkTrialStatus())
      .then(() => checkUserLicense())
      .then(() => checkUserPreferences())
      .then(() => processSelection(webContents));
  });

  webContents.on("CHECK_USER_CONSENT", async () => checkUserConsent());
  webContents.on("CHECK_ANNOUNCEMENTS_STATUS", async (msg) =>
    checkAnnouncementsStatus(msg.data.version)
  );

  webContents.on("UPDATE_LANGUAGE", (msg) => {
    Settings.setSettingForKey("user_language", msg.data.lang);
    locales.set(msg.lang);
  });

  webContents.on("SET_ITEMS", (msg) => {
    msg.items.forEach((item) => {
      if (typeof item.value === "object")
        Settings.setSettingForKey(item.key, JSON.stringify(item.value));
      else if (
        typeof item.value === "boolean" ||
        typeof item.value === "number"
      )
        Settings.setSettingForKey(item.key, item.value.toString());
      else Settings.setSettingForKey(item.key, item.value);
    });
  });
  webContents.on("GET_ITEMS", (msg) => {
    msg.items.map((item) => {
      const value = Settings.getSettingForKey(item);
      if (value && typeof value === "string")
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: `GET_ITEM_${item.toUpperCase()}`,
            value: value,
          })})`
        );
    });
  });
  webContents.on("DELETE_ITEMS", (msg) => {
    msg.items.forEach((item) => {
      Settings.setSettingForKey(item, undefined);
    });
  });

  webContents.on("GET_PALETTES", async () => getPalettesOnCurrentPage());

  browserWindow.loadURL(require("../resources/webview.html"));
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier);
  if (existingWebview) {
    existingWebview.close();
  }
}

export const onSelectionChanged = () => {
  const existingWebview = getWebview(webviewIdentifier);
  processSelection(existingWebview.webContents);
};
