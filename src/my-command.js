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
import createPalette from "./bridges/creations/createPalette";
import createDocument from "./bridges/creations/createDocument";
import createPaletteFromDocument from "./bridges/creations/createPaletteFromDocument";
import createPaletteFromRemote from "./bridges/creations/createPaletteFromRemote";
import createPaletteFromDuplication from "./bridges/creations/createPaletteFromDuplication";
import deletePalette from "./bridges/creations/deletePalette";
import processSelection from "./bridges/processSelection.ts";
import updateScale from "./bridges/updates/updateScale";
import updateColors from "./bridges/updates/updateColors";
import updateThemes from "./bridges/updates/updateThemes";
import updateSettings from "./bridges/updates/updateSettings";
import updatePalette from "./bridges/updates/updatePalette";
// import updateDocument from "./bridges/updates/updateDocument";
import createLocalStyles from "./bridges/creations/createLocalStyles";
import updateLocalStyles from "./bridges/updates/updateLocalStyles";
import createLocalVariables from "./bridges/creations/createLocalVariables";
import updateLocalVariables from "./bridges/updates/updateLocalVariables";
import jumpToPalette from "./bridges/jumpToPalette";
import enableTrial from "./bridges/enableTrial";
import exportJsonDtcg from "./bridges/exports/exportJsonDtcg";
import exportJson from "./bridges/exports/exportJson";
import exportJsonAmznStyleDictionary from "./bridges/exports/exportJsonAmznStyleDictionary";
import exportJsonTokensStudio from "./bridges/exports/exportJsonTokensStudio";
import exportCss from "./bridges/exports/exportCss";
import exportTailwind from "./bridges/exports/exportTailwind";
import exportSwiftUI from "./bridges/exports/exportSwiftUI";
import exportUIKit from "./bridges/exports/exportUIKit";
import exportKt from "./bridges/exports/exportKt";
import exportXml from "./bridges/exports/exportXml";
import exportCsv from "./bridges/exports/exportCsv";
import { setWebContents } from "./utils/webContents";
import { locales } from "../resources/content/locales";
import globalConfig from "./global.config.ts";

const webviewIdentifier = "sketch-ui-color-palette.webview";

export default function () {
  const windowSize = {
    width: parseFloat(Settings.settingForKey("plugin_window_width") ?? "640"),
    height: parseFloat(Settings.settingForKey("plugin_window_height") ?? "640"),
  };
  const windowPosition = {
    x: parseFloat(Settings.settingForKey("plugin_window_x") ?? "0"),
    y: parseFloat(Settings.settingForKey("plugin_window_y") ?? "0"),
  };

  const options = {
    identifier: webviewIdentifier,
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 640,
    minHeight: 640,
    x: windowPosition.x,
    y: windowPosition.y,
    fullscreenable: false,
    show: false,
    title: `${locales.get().name}${locales.get().separator}${locales.get().tagline}`,
    webPreferences: {
      plugins: false,
      devTools: globalConfig.env.isDev,
    },
    hidesOnDeactivate: false,
  };

  const browserWindow = new BrowserWindow(options);

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
  });

  const webContents = browserWindow.webContents;
  setWebContents(webContents);

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
          theme: UI.getTheme() === "light" ? "sketch-light" : "sketch-dark",
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
      .then(() => processSelection());
  });

  webContents.on("CHECK_USER_CONSENT", () => checkUserConsent());
  webContents.on("CHECK_ANNOUNCEMENTS_STATUS", (msg) =>
    checkAnnouncementsStatus(msg.data.version)
  );

  webContents.on("UPDATE_SCALE", (msg) => updateScale(msg));
  webContents.on("UPDATE_COLORS", (msg) => updateColors(msg));
  webContents.on("UPDATE_THEMES", (msg) => updateThemes(msg));
  webContents.on("UPDATE_SETTINGS", (msg) => updateSettings(msg));
  webContents.on("UPDATE_PALETTE", (msg) =>
    updatePalette({
      msg: msg,
      isAlreadyUpdated: msg.isAlreadyUpdated,
      shouldLoadPalette: msg.shouldLoadPalette,
    })
  );
  // webContents.on("UPDATE_DOCUMENT", (msg) =>
  //   updateDocument(msg.view)
  //     .finally(() =>
  //       webContents.executeJavaScript(
  //         `sendData(${JSON.stringify({
  //           type: "STOP_LOADER",
  //         })})`
  //       )
  //     )
  //     .catch((error) => {
  //       webContents.executeJavaScript(
  //         `sendData(${JSON.stringify({
  //           type: "POST_MESSAGE",
  //           data: {
  //             type: "ERROR",
  //             message: error.message,
  //           },
  //         })})`
  //       );
  //     })
  // );
  webContents.on("UPDATE_LANGUAGE", (msg) => {
    Settings.setSettingForKey("user_language", msg.data.lang);
    locales.set(msg.lang);
  });

  webContents.on("CREATE_PALETTE", (msg) =>
    createPalette(msg).finally(() =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: "STOP_LOADER",
        })})`
      )
    )
  );
  webContents.on("CREATE_PALETTE_FROM_DOCUMENT", () =>
    createPaletteFromDocument().finally(() =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: "STOP_LOADER",
        })})`
      )
    )
  );
  webContents.on("CREATE_PALETTE_FROM_REMOTE", (msg) =>
    createPaletteFromRemote(msg)
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "STOP_LOADER",
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "INFO",
              message: error.message,
            },
          })})`
        );
      })
  );
  // webContents.on("CREATE_DOCUMENT", (msg) =>
  //   createDocument(msg.id, msg.view)
  //     .finally(() =>
  //       webContents.executeJavaScript(
  //         `sendData(${JSON.stringify({
  //           type: "STOP_LOADER",
  //         })})`
  //       )
  //     )
  //     .catch((error) => {
  //       webContents.executeJavaScript(
  //         `sendData(${JSON.stringify({
  //           type: "POST_MESSAGE",
  //           data: {
  //             type: "ERROR",
  //             message: error.message,
  //           },
  //         })})`
  //       );
  //     })
  // );
  webContents.on("SYNC_LOCAL_STYLES", (msg) =>
    createLocalStyles(msg.id)
      .then(async (message) => [message, await updateLocalStyles(msg.id)])
      .then((messages) =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "INFO",
              message: messages.join(locales.get().separator),
              timer: 10000,
            },
          })})`
        )
      )
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "STOP_LOADER",
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "ERROR",
              message: error.message,
            },
          })})`
        );
      })
  );
  webContents.on("SYNC_LOCAL_VARIABLES", (msg) =>
    createLocalVariables(msg.id)
      .then(async (message) => [message, await updateLocalVariables(msg.id)])
      .then((messages) =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "INFO",
              message: messages.join(locales.get().separator),
              timer: 10000,
            },
          })})`
        )
      )
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "STOP_LOADER",
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "ERROR",
              message: error.message,
            },
          })})`
        );
      })
  );

  webContents.on("EXPORT_PALETTE", (msg) => {
    if (msg.export === "TOKENS_DTCG") {
      exportJsonDtcg(msg.id, msg.colorSpace);
    } else if (msg.export === "TOKENS_GLOBAL") {
      exportJson(msg.id);
    } else if (msg.export === "TOKENS_AMZN_STYLE_DICTIONARY") {
      exportJsonAmznStyleDictionary(msg.id);
    } else if (msg.export === "TOKENS_TOKENS_STUDIO") {
      exportJsonTokensStudio(msg.id);
    } else if (msg.export === "CSS") {
      exportCss(msg.id, msg.colorSpace);
    } else if (msg.export === "TAILWIND") {
      exportTailwind(msg.id);
    } else if (msg.export === "APPLE_SWIFTUI") {
      exportSwiftUI(msg.id);
    } else if (msg.export === "APPLE_UIKIT") {
      exportUIKit(msg.id);
    } else if (msg.export === "ANDROID_COMPOSE") {
      exportKt(msg.id);
    } else if (msg.export === "ANDROID_XML") {
      exportXml(msg.id);
    } else if (msg.export === "CSV") {
      exportCsv(msg.id);
    }
  });

  webContents.on("SET_ITEMS", (msg) => {
    msg.items.forEach((item) => {
      Settings.setSettingForKey(item.key, item.value);
    });
  });
  webContents.on("GET_ITEMS", (msg) => {
    msg.items.map((item) => {
      const value = Settings.getSettingForKey(item);
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: `GET_ITEM_${item.toUpperCase()}`,
          data: {
            value: value,
          },
        })})`
      );
    });
  });
  webContents.on("DELETE_ITEMS", (msg) => {
    msg.items.forEach((item) => {
      Settings.setSettingForKey(item, undefined);
    });
  });

  webContents.on("OPEN_IN_BROWSER", (msg) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(msg.url));
  });
  webContents.on("GET_PALETTES", () => getPalettesOnCurrentPage(webContents));
  webContents.on("JUMP_TO_PALETTE", (msg) =>
    jumpToPalette(msg.id).catch((error) =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: "POST_MESSAGE",
          data: {
            type: "ERROR",
            message: error.message,
          },
        })})`
      )
    )
  );
  webContents.on("DUPLICATE_PALETTE", (msg) =>
    createPaletteFromDuplication(msg.id)
      .finally(() => {
        getPalettesOnCurrentPage();
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "STOP_LOADER",
          })})`
        );
      })
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "ERROR",
              message: error.message,
            },
          })})`
        );
      })
  );
  webContents.on("DELETE_PALETTE", (msg) =>
    deletePalette(msg.id).finally(() => {
      getPalettesOnCurrentPage(webContents);
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: "STOP_LOADER",
        })})`
      );
    })
  );

  webContents.on("ENABLE_TRIAL", (msg) => {
    enableTrial(msg.data.trialTime, msg.data.trialVersion)
      .then(() => checkTrialStatus())
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: "POST_MESSAGE",
            data: {
              type: "ERROR",
              message: error.message,
            },
          })})`
        );
      });
  });
  webContents.on("GET_TRIAL", () => {
    const userId = Settings.settingForKey("user_id") || "";
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "GET_TRIAL",
        data: {
          id: userId,
        },
      })})`
    );
  });
  webContents.on("GET_PRO_PLAN", () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "GET_PRICING",
        data: {
          plans: ["ONE"],
        },
      })})`
    );
  });
  webContents.on("ENABLE_PRO_PLAN", () => {
    const userId = Settings.settingForKey("user_id") || "";
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "ENABLE_PRO_PLAN",
        data: {
          id: userId,
        },
      })})`
    );
  });
  webContents.on("LEAVE_PRO_PLAN", () => {
    const userId = Settings.settingForKey("user_id") || "";
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "LEAVE_PRO_PLAN",
        data: {
          id: userId,
        },
      })})`
    );
  });
  webContents.on("WELCOME_TO_PRO", () => {
    const userId = Settings.settingForKey("user_id") || "";
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "WELCOME_TO_PRO",
        data: {
          id: userId,
        },
      })})`
    );
  });
  webContents.on("SIGN_OUT", () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: "SIGN_OUT",
        data: {
          connectionStatus: "UNCONNECTED",
          userFullName: "",
          userAvatar: "",
          userId: undefined,
        },
      })})`
    );
  });

  browserWindow.loadURL(require("../resources/webview.html"));

  browserWindow.on("resize", () => {
    const size = browserWindow.getSize();
    Settings.setSettingForKey("plugin_window_width", size[0]);
    Settings.setSettingForKey("plugin_window_height", size[1]);
  });

  browserWindow.on("move", () => {
    const position = browserWindow.getPosition();
    Settings.setSettingForKey("plugin_window_x", position[0]);
    Settings.setSettingForKey("plugin_window_y", position[1]);
  });
}

export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier);
  if (existingWebview) {
    existingWebview.close();
  }
}

export const onChangeSelection = () => {
  const existingWebview = getWebview(webviewIdentifier);
  processSelection(existingWebview.webContents);
};

export const onPreviousPage = () => {
  console.log("Previous page action triggered");
};

export const onNextPage = () => {
  console.log("Next page action triggered");
};

export const onNewPage = () => {
  console.log("New page created");
};

export const onOpenDocument = () => {
  console.log("Open document");
};

export const onShowComponentsPane = () => {
  console.log("Show components pane");
};

export const onCloseDocument = () => {
  console.log("Close document");
};
