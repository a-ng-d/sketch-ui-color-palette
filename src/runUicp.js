import { getWebview } from 'sketch-module-web-view/remote'
import BrowserWindow from 'sketch-module-web-view'
import UI from 'sketch/ui'
import Settings from 'sketch/settings'
import webviewHtmlUrl from '../resources/webview.html'
import { locales } from '../resources/content/locales.ts'
import { setWebContents } from './utils/webContents.ts'
import globalConfig from './global.config.ts'
import updateThemes from './bridges/updates/updateThemes.ts'
import updateSettings from './bridges/updates/updateSettings.ts'
import updateScale from './bridges/updates/updateScale.ts'
import updatePalette from './bridges/updates/updatePalette.ts'
import updateLocalVariables from './bridges/updates/updateLocalVariables.ts'
import updateLocalStyles from './bridges/updates/updateLocalStyles.ts'
import updateColors from './bridges/updates/updateColors.ts'
import processSelection from './bridges/processSelection.ts'
import jumpToPalette from './bridges/jumpToPalette.ts'
import getPalettesOnCurrentFile from './bridges/getPalettesOnCurrentFile.ts'
import exportXml from './bridges/exports/exportXml.ts'
import exportUIKit from './bridges/exports/exportUIKit.ts'
import exportTailwind from './bridges/exports/exportTailwind.ts'
import exportSwiftUI from './bridges/exports/exportSwiftUI.ts'
import exportKt from './bridges/exports/exportKt.ts'
import exportJsonTokensStudio from './bridges/exports/exportJsonTokensStudio.ts'
import exportJsonDtcg from './bridges/exports/exportJsonDtcg.ts'
import exportJsonAmznStyleDictionary from './bridges/exports/exportJsonAmznStyleDictionary.ts'
import exportJson from './bridges/exports/exportJson.ts'
import exportCsv from './bridges/exports/exportCsv.ts'
import exportCss from './bridges/exports/exportCss.ts'
import enableTrial from './bridges/enableTrial.ts'
import deletePalette from './bridges/creations/deletePalette.ts'
import createPaletteFromRemote from './bridges/creations/createPaletteFromRemote.ts'
import createPaletteFromDuplication from './bridges/creations/createPaletteFromDuplication.ts'
import createPaletteFromDocument from './bridges/creations/createPaletteFromDocument.ts'
import createPalette from './bridges/creations/createPalette.ts'
import createLocalVariables from './bridges/creations/createLocalVariables.ts'
import createLocalStyles from './bridges/creations/createLocalStyles.ts'
import checkUserPreferences from './bridges/checks/checkUserPreferences.ts'
import checkUserLicense from './bridges/checks/checkUserLicense.ts'
import checkUserConsent from './bridges/checks/checkUserConsent.ts'
import checkTrialStatus from './bridges/checks/checkTrialStatus.ts'
import checkAnnouncementsStatus from './bridges/checks/checkAnnouncementsStatus.ts'
// import createDocument from "./bridges/creations/createDocument";
// import updateDocument from "./bridges/updates/updateDocument";

const webviewIdentifier = 'sketch-ui-color-palette.webview'

export default function () {
  const windowSize = {
    width: parseFloat(Settings.settingForKey('plugin_window_width') ?? '640'),
    height: parseFloat(Settings.settingForKey('plugin_window_height') ?? '640'),
  }
  const windowPosition = {
    x: parseFloat(Settings.settingForKey('plugin_window_x') ?? '0'),
    y: parseFloat(Settings.settingForKey('plugin_window_y') ?? '0'),
  }

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
  }

  const browserWindow = new BrowserWindow(options)

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  const webContents = browserWindow.webContents
  setWebContents(webContents)

  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!')

    // Canvas > UI
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'CHECK_USER_AUTHENTICATION',
        data: {
          id: '',
          fullName: '',
          avatar: '',
          accessToken: Settings.settingForKey('supabase_access_token'),
          refreshToken: Settings.settingForKey('supabase_refresh_token'),
        },
      })})`
    )
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'SET_THEME',
        data: {
          theme: UI.getTheme() === 'light' ? 'sketch-light' : 'sketch-dark',
        },
      })})`
    )
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'CHECK_ANNOUNCEMENTS_VERSION',
      })})`
    )

    // Checks
    checkUserConsent()
      .then(() => checkTrialStatus())
      .then(() => checkUserLicense())
      .then(() => checkUserPreferences())
      .then(() => processSelection())
  })

  webContents.on('CHECK_USER_CONSENT', () => checkUserConsent())
  webContents.on('CHECK_ANNOUNCEMENTS_STATUS', (msg) =>
    checkAnnouncementsStatus(msg.data.version)
  )

  webContents.on('UPDATE_SCALE', (msg) => updateScale(msg))
  webContents.on('UPDATE_COLORS', (msg) => updateColors(msg))
  webContents.on('UPDATE_THEMES', (msg) => updateThemes(msg))
  webContents.on('UPDATE_SETTINGS', (msg) => updateSettings(msg))
  webContents.on('UPDATE_PALETTE', (msg) =>
    updatePalette({
      msg: msg,
      isAlreadyUpdated: msg.isAlreadyUpdated,
      shouldLoadPalette: msg.shouldLoadPalette,
    })
  )
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
  webContents.on('UPDATE_LANGUAGE', (msg) => {
    Settings.setSettingForKey('user_language', msg.data.lang)
    locales.set(msg.lang)
  })

  webContents.on('CREATE_PALETTE', (msg) =>
    createPalette(msg).finally(() =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'STOP_LOADER',
        })})`
      )
    )
  )
  webContents.on('CREATE_PALETTE_FROM_DOCUMENT', () =>
    createPaletteFromDocument().finally(() =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'STOP_LOADER',
        })})`
      )
    )
  )
  webContents.on('CREATE_PALETTE_FROM_REMOTE', (msg) =>
    createPaletteFromRemote(msg)
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'STOP_LOADER',
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: error.message,
            },
          })})`
        )
      })
  )
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
  webContents.on('SYNC_LOCAL_STYLES', (msg) =>
    createLocalStyles(msg.id)
      .then(async (message) => [message, await updateLocalStyles(msg.id)])
      .then((messages) =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: messages.join(locales.get().separator),
              timer: 10000,
            },
          })})`
        )
      )
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'STOP_LOADER',
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })})`
        )
      })
  )
  webContents.on('SYNC_LOCAL_VARIABLES', (msg) =>
    createLocalVariables(msg.id)
      .then(async (message) => [message, await updateLocalVariables(msg.id)])
      .then((messages) =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: messages.join(locales.get().separator),
              timer: 10000,
            },
          })})`
        )
      )
      .finally(() =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'STOP_LOADER',
          })})`
        )
      )
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })})`
        )
      })
  )

  webContents.on('EXPORT_PALETTE', (msg) => {
    if (msg.export === 'TOKENS_DTCG') exportJsonDtcg(msg.id, msg.colorSpace)
    else if (msg.export === 'TOKENS_GLOBAL') exportJson(msg.id)
    else if (msg.export === 'TOKENS_AMZN_STYLE_DICTIONARY')
      exportJsonAmznStyleDictionary(msg.id)
    else if (msg.export === 'TOKENS_TOKENS_STUDIO')
      exportJsonTokensStudio(msg.id)
    else if (msg.export === 'CSS') exportCss(msg.id, msg.colorSpace)
    else if (msg.export === 'TAILWIND') exportTailwind(msg.id)
    else if (msg.export === 'APPLE_SWIFTUI') exportSwiftUI(msg.id)
    else if (msg.export === 'APPLE_UIKIT') exportUIKit(msg.id)
    else if (msg.export === 'ANDROID_COMPOSE') exportKt(msg.id)
    else if (msg.export === 'ANDROID_XML') exportXml(msg.id)
    else if (msg.export === 'CSV') exportCsv(msg.id)
  })

  webContents.on('POST_MESSAGE', (msg) => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'POST_MESSAGE',
        data: {
          type: msg.data.type,
          message: msg.data.message,
        },
      })})`
    )
  })
  webContents.on('SET_ITEMS', (msg) => {
    msg.items.forEach((item) => {
      Settings.setSettingForKey(item.key, item.value)
    })
  })
  webContents.on('GET_ITEMS', (msg) => {
    msg.items.map((item) => {
      const value = Settings.getSettingForKey(item)
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: `GET_ITEM_${item.toUpperCase()}`,
          data: {
            value: value,
          },
        })})`
      )
    })
  })
  webContents.on('DELETE_ITEMS', (msg) => {
    msg.items.forEach((item) => {
      Settings.setSettingForKey(item, undefined)
    })
  })

  webContents.on('OPEN_IN_BROWSER', (msg) => {
    // eslint-disable-next-line no-undef
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(msg.url))
  })
  webContents.on('GET_PALETTES', () => getPalettesOnCurrentFile(webContents))
  webContents.on('JUMP_TO_PALETTE', (msg) =>
    jumpToPalette(msg.id).catch((error) =>
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'POST_MESSAGE',
          data: {
            type: 'ERROR',
            message: error.message,
          },
        })})`
      )
    )
  )
  webContents.on('DUPLICATE_PALETTE', (msg) =>
    createPaletteFromDuplication(msg.id)
      .finally(() => {
        getPalettesOnCurrentFile()
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'STOP_LOADER',
          })})`
        )
      })
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })})`
        )
      })
  )
  webContents.on('DELETE_PALETTE', (msg) =>
    deletePalette(msg.id).finally(() => {
      getPalettesOnCurrentFile(webContents)
      webContents.executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'STOP_LOADER',
        })})`
      )
    })
  )

  webContents.on('ENABLE_TRIAL', (msg) => {
    enableTrial(msg.data.trialTime, msg.data.trialVersion)
      .then(() => checkTrialStatus())
      .catch((error) => {
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })})`
        )
      })
  })
  webContents.on('GET_TRIAL', () => {
    const userId = Settings.settingForKey('user_id') || ''
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'GET_TRIAL',
        data: {
          id: userId,
        },
      })})`
    )
  })
  webContents.on('GET_PRO_PLAN', () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'GET_PRICING',
        data: {
          plans: ['ONE'],
        },
      })})`
    )
  })
  webContents.on('ENABLE_PRO_PLAN', () => {
    const userId = Settings.settingForKey('user_id') || ''
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'ENABLE_PRO_PLAN',
        data: {
          id: userId,
        },
      })})`
    )
  })
  webContents.on('LEAVE_PRO_PLAN', () => {
    const userId = Settings.settingForKey('user_id') || ''
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'LEAVE_PRO_PLAN',
        data: {
          id: userId,
        },
      })})`
    )
    checkTrialStatus()
  })
  webContents.on('WELCOME_TO_PRO', () => {
    const userId = Settings.settingForKey('user_id') || ''
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'WELCOME_TO_PRO',
        data: {
          id: userId,
        },
      })})`
    )
  })
  webContents.on('SIGN_OUT', () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'SIGN_OUT',
        data: {
          connectionStatus: 'UNCONNECTED',
          userFullName: '',
          userAvatar: '',
          userId: undefined,
        },
      })})`
    )
  })

  browserWindow.loadURL(webviewHtmlUrl)

  browserWindow.on('resize', () => {
    const size = browserWindow.getSize()
    Settings.setSettingForKey('plugin_window_width', size[0])
    Settings.setSettingForKey('plugin_window_height', size[1])
  })

  browserWindow.on('move', () => {
    const position = browserWindow.getPosition()
    Settings.setSettingForKey('plugin_window_x', position[0])
    Settings.setSettingForKey('plugin_window_y', position[1])
  })
}

export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) existingWebview.close()
}

export const onChangeSelection = () => {
  const existingWebview = getWebview(webviewIdentifier)
  processSelection(existingWebview.webContents)
}

export const onOpenDocument = () => {
  const existingWebview = getWebview(webviewIdentifier)
  getPalettesOnCurrentFile(existingWebview.webContents)
}
