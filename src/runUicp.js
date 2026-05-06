import { getWebview } from 'sketch-module-web-view/remote'
import BrowserWindow from 'sketch-module-web-view'
import UI from 'sketch/ui'
import Settings from 'sketch/settings'
import zh_Hans_CN from '@ui-lib/content/translations/zh-Hans-CN.json'
import pt_BR from '@ui-lib/content/translations/pt-BR.json'
import ko_KR from '@ui-lib/content/translations/ko-KR.json'
import ja_JP from '@ui-lib/content/translations/ja-JP.json'
import fr_FR from '@ui-lib/content/translations/fr-FR.json'
import es_ES from '@ui-lib/content/translations/es-ES.json'
import en_US from '@ui-lib/content/translations/en-US.json'
import webviewHtmlUrl from '../resources/webview.html'
import { setWebContents } from './utils/webContents.ts'
import { createI18n } from './utils/i18n.ts'
import globalConfig from './global.config.ts'
import updateThemes from './bridges/updates/updateThemes.ts'
import updateSettings from './bridges/updates/updateSettings.ts'
import updateScale from './bridges/updates/updateScale.ts'
import updatePalette from './bridges/updates/updatePalette.ts'
import updateLocalVariables from './bridges/updates/updateLocalVariables.ts'
import updateLocalStyles from './bridges/updates/updateLocalStyles.ts'
import updateDocument from './bridges/updates/updateDocument'
import updateColors from './bridges/updates/updateColors.ts'
import enableTrial from './bridges/plans/enableTrial.ts'
import processSelection from './bridges/gets/processSelection.ts'
import jumpToPalette from './bridges/gets/jumpToPalette.ts'
import getPalettesOnCurrentFile from './bridges/gets/getPalettesOnCurrentFile.ts'
import deletePalette from './bridges/deletions/deletePalette.ts'
import createPaletteFromRemote from './bridges/creations/createPaletteFromRemote.ts'
import createPaletteFromDuplication from './bridges/creations/createPaletteFromDuplication.ts'
import createPaletteFromDocument from './bridges/creations/createPaletteFromDocument.ts'
import createPalette from './bridges/creations/createPalette.ts'
import createLocalVariables from './bridges/creations/createLocalVariables.ts'
import createLocalStyles from './bridges/creations/createLocalStyles.ts'
import createDocument from './bridges/creations/createDocument'
import checkUserPreferences from './bridges/checks/checkUserPreferences.ts'
import checkUserLicense from './bridges/checks/checkUserLicense.ts'
import checkUserConsent from './bridges/checks/checkUserConsent.ts'
import checkTrialStatus from './bridges/checks/checkTrialStatus.ts'
import checkCredits from './bridges/checks/checkCredits.ts'
import checkAnnouncementsStatus from './bridges/checks/checkAnnouncementsStatus.ts'

const webviewIdentifier = 'sketch-ui-color-palette.webview'

export const tolgee = createI18n(
  {
    'zh-Hans-CN': zh_Hans_CN,
    'pt-BR': pt_BR,
    'fr-FR': fr_FR,
    'en-US': en_US,
    'es-ES': es_ES,
    'ja-JP': ja_JP,
    'ko-KR': ko_KR,
  },
  globalConfig.lang
)

export default function () {
  const windowSize = {
    width:
      Settings.settingForKey('plugin_window_width') ??
      globalConfig.limits.width,
    height:
      Settings.settingForKey('plugin_window_height') ??
      globalConfig.limits.height,
  }
  const windowPosition = {
    x: Settings.settingForKey('plugin_window_x') ?? 0,
    y: Settings.settingForKey('plugin_window_y') ?? 0,
  }

  const options = {
    identifier: webviewIdentifier,
    width: windowSize.width,
    height: windowSize.height,
    minWidth: globalConfig.limits.minWidth,
    minHeight: globalConfig.limits.minHeight,
    x: windowPosition.x,
    y: windowPosition.y,
    fullscreenable: false,
    alwaysOnTop: true,
    show: true,
    isClosable: true,
    title: tolgee.t('fullName', {
      instance: '/one',
    }),
    webPreferences: {
      plugins: false,
      devTools: true,
    },
    hidesOnDeactivate: false,
  }

  const browserWindow = new BrowserWindow(options)

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  const webContents = browserWindow.webContents
  setWebContents(webContents)

  webContents.on('LOAD_DATA', (msg) => {
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
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'CHECK_EDITOR',
        data: {
          id: '',
          editor: globalConfig.env.editor,
        },
      })})`
    )

    checkUserConsent(msg.data.userConsent)
      .then(() => checkTrialStatus())
      .then(() => checkCredits())
      .then(() => checkUserLicense())
      .then(() => checkUserPreferences())
      .then(() => processSelection())
  })
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
  webContents.on('UPDATE_DOCUMENT', (msg) =>
    updateDocument(msg.view)
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
  webContents.on('UPDATE_LANGUAGE', (msg) => {
    Settings.setSettingForKey('user_language', msg.data.lang)
    tolgee.changeLanguage(msg.data.lang)
  })

  webContents.on('CREATE_PALETTE', (msg) =>
    createPalette(msg)
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
  webContents.on('CREATE_PALETTE_FROM_DOCUMENT', () =>
    createPaletteFromDocument().finally(() =>
      webContents
        .executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'STOP_LOADER',
          })})`
        )
        .catch((error) => {
          webContents.executeJavaScript(
            `sendData(${JSON.stringify({
              type: 'REPORT_ERROR',
              data: error,
            })})`
          )
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
  webContents.on('CREATE_DOCUMENT', (msg) =>
    createDocument(msg.id, msg.view)
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
  webContents.on('SYNC_LOCAL_STYLES', (msg) =>
    createLocalStyles(msg.id)
      .then(async (message) => [message, await updateLocalStyles(msg.id)])
      .then((messages) =>
        webContents.executeJavaScript(
          `sendData(${JSON.stringify({
            type: 'POST_MESSAGE',
            data: {
              type: 'INFO',
              message: messages.join(tolgee.t('separator')),
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
              message: messages.join(tolgee.t('separator')),
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
      const value = Settings.settingForKey(item)
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
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(msg.data.url))
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
            type: 'REPORT_ERROR',
            data: error,
          })})`
        )
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
  webContents.on('GET_PRO', () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'GET_PRICING',
        data: {
          licenseTrigger: 'ACTIVATE',
        },
      })})`
    )
  })
  webContents.on('GET_LICENSE', () => {
    webContents.executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'GET_LICENSE',
      })})`
    )
  })
  webContents.on('GO_TO_ULTIMATE_REQUEST', () => {
    // eslint-disable-next-line no-undef
    NSWorkspace.sharedWorkspace().openURL(
      // eslint-disable-next-line no-undef
      NSURL.URLWithString(globalConfig.urls.storeUltimateRequestUrl)
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
          userId: '',
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

export const onShutdown = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) existingWebview.close()
}

export const onChangeSelection = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) processSelection(existingWebview.webContents)
  if (existingWebview) checkTrialStatus(existingWebview.webContents)
}

export const onOpenDocument = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) existingWebview.reload()
}

export const onCloseDocument = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) existingWebview.close()
}
