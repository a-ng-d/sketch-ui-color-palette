import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import { Language } from '../../types/translations'
import { locales } from '../../../resources/content/locales'

const checkUserPreferences = async () => {
  const isWCAGDisplayed = Settings.settingForKey('is_wcag_displayed')
  const isAPCADisplayed = Settings.settingForKey('is_apca_displayed')
  const canDeepSyncStyles = Settings.settingForKey('can_deep_sync_styles')
  const canDeepSyncVariables = Settings.settingForKey('can_deep_sync_variables')
  const isVsCodeMessageDisplayed = Settings.settingForKey(
    'is_vscode_message_displayed'
  )
  const userLanguage = Settings.settingForKey('user_language')

  if (isWCAGDisplayed === undefined)
    Settings.setSettingForKey('is_wcag_displayed', true)

  if (isAPCADisplayed === undefined)
    Settings.setSettingForKey('is_apca_displayed', true)

  if (canDeepSyncStyles === undefined)
    Settings.setSettingForKey('can_deep_sync_styles', false)

  if (canDeepSyncVariables === undefined)
    Settings.setSettingForKey('can_deep_sync_variables', false)

  if (isVsCodeMessageDisplayed === undefined)
    Settings.setSettingForKey('is_vscode_message_displayed', true)

  if (userLanguage === undefined)
    Settings.setSettingForKey('user_language', 'en-US')

  locales.set((userLanguage as Language) ?? 'en-US')

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed: isWCAGDisplayed === undefined ? true : isWCAGDisplayed,
        isAPCADisplayed: isAPCADisplayed === undefined ? true : isAPCADisplayed,
        canDeepSyncStyles:
          canDeepSyncStyles === undefined ? false : canDeepSyncStyles,
        canDeepSyncVariables:
          canDeepSyncVariables === undefined ? false : canDeepSyncVariables,
        isVsCodeMessageDisplayed:
          isVsCodeMessageDisplayed === undefined
            ? true
            : isVsCodeMessageDisplayed,
        userLanguage: userLanguage === undefined ? 'en-US' : userLanguage,
      },
    })})`
  )

  return true
}

export default checkUserPreferences
