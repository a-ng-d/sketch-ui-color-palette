import Settings from 'sketch/settings'
import { locales } from '@ui-lib/content/locales'
import { getWebContents } from '../../utils/webContents'
import { Language } from '../../types/translations'
import globalConfig from '../../global.config'

const checkUserPreferences = async () => {
  let isWCAGDisplayed = Settings.settingForKey('is_wcag_displayed')
  let isAPCADisplayed = Settings.settingForKey('is_apca_displayed')
  let canDeepSyncStyles = Settings.settingForKey('can_deep_sync_styles')
  let canDeepSyncVariables = Settings.settingForKey('can_deep_sync_variables')
  let isVsCodeMessageDisplayed = Settings.settingForKey(
    'is_vscode_message_displayed'
  )
  let userLanguage = Settings.settingForKey('user_language')

  if (isWCAGDisplayed === undefined) {
    Settings.setSettingForKey('is_wcag_displayed', true)
    isWCAGDisplayed = true
  }

  if (isAPCADisplayed === undefined) {
    Settings.setSettingForKey('is_apca_displayed', true)
    isAPCADisplayed = true
  }

  if (canDeepSyncStyles === undefined) {
    Settings.setSettingForKey('can_deep_sync_styles', false)
    canDeepSyncStyles = false
  }

  if (canDeepSyncVariables === undefined) {
    Settings.setSettingForKey('can_deep_sync_variables', false)
    canDeepSyncVariables = false
  }

  if (isVsCodeMessageDisplayed === undefined) {
    Settings.setSettingForKey('is_vscode_message_displayed', true)
    isVsCodeMessageDisplayed = true
  }

  if (userLanguage === undefined) {
    Settings.setSettingForKey('user_language', globalConfig.lang)
    userLanguage = globalConfig.lang
  }

  locales.set((userLanguage as Language) ?? globalConfig.lang)

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed: isWCAGDisplayed,
        isAPCADisplayed: isAPCADisplayed,
        canDeepSyncStyles: canDeepSyncStyles,
        canDeepSyncVariables: canDeepSyncVariables,
        isVsCodeMessageDisplayed: isVsCodeMessageDisplayed,
        userLanguage: userLanguage,
      },
    })})`
  )

  return true
}

export default checkUserPreferences
