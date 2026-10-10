import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import { tolgee } from '../../runUicp'
import globalConfig from '../../global.config'

const checkUserPreferences = async () => {
  let isWCAGDisplayed = Settings.settingForKey('is_wcag_displayed')
  let isAPCADisplayed = Settings.settingForKey('is_apca_displayed')
  let isWCAGIntervalDisplayed = Settings.settingForKey(
    'is_wcag_interval_displayed'
  )
  let isAPCAIntervalDisplayed = Settings.settingForKey(
    'is_apca_interval_displayed'
  )
  let canDeepSyncStyles = Settings.settingForKey('can_deep_sync_styles')
  let canDeepSyncVariables = Settings.settingForKey('can_deep_sync_variables')
  let isSuggestedLanguageDisplayed = Settings.settingForKey(
    'is_suggested_language_displayed'
  )
  let userLanguage = Settings.settingForKey('user_language')
  let isOnboardingRead = Settings.settingForKey('is_onboarding_read')
  let palettesView = Settings.settingForKey('palettes_view')

  if (isWCAGDisplayed === undefined) {
    Settings.setSettingForKey('is_wcag_displayed', false)
    isWCAGDisplayed = false
  }

  if (isAPCADisplayed === undefined) {
    Settings.setSettingForKey('is_apca_displayed', true)
    isAPCADisplayed = true
  }

  if (isWCAGIntervalDisplayed === undefined) {
    Settings.setSettingForKey('is_wcag_interval_displayed', false)
    isWCAGIntervalDisplayed = false
  }

  if (isAPCAIntervalDisplayed === undefined) {
    Settings.setSettingForKey('is_apca_interval_displayed', false)
    isAPCAIntervalDisplayed = false
  }

  if (canDeepSyncStyles === undefined) {
    Settings.setSettingForKey('can_deep_sync_styles', false)
    canDeepSyncStyles = false
  }

  if (canDeepSyncVariables === undefined) {
    Settings.setSettingForKey('can_deep_sync_variables', false)
    canDeepSyncVariables = false
  }

  if (isSuggestedLanguageDisplayed === undefined) {
    Settings.setSettingForKey('is_suggested_language_displayed', true)
    isSuggestedLanguageDisplayed = true
  }

  if (userLanguage === undefined) {
    Settings.setSettingForKey('user_language', globalConfig.lang)
    userLanguage = globalConfig.lang
  }

  if (isOnboardingRead === undefined) {
    Settings.setSettingForKey('is_onboarding_read', false)
    isOnboardingRead = false
  }

  if (palettesView === undefined) {
    Settings.setSettingForKey('palettes_view', 'LIST')
    palettesView = 'LIST'
  }

  tolgee.changeLanguage(userLanguage)

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_USER_PREFERENCES',
      data: {
        isWCAGDisplayed: isWCAGDisplayed,
        isAPCADisplayed: isAPCADisplayed,
        isWCAGIntervalDisplayed: isWCAGIntervalDisplayed,
        isAPCAIntervalDisplayed: isAPCAIntervalDisplayed,
        canDeepSyncStyles: canDeepSyncStyles,
        canDeepSyncVariables: canDeepSyncVariables,
        isSuggestedLanguageDisplayed: isSuggestedLanguageDisplayed,
        userLanguage: userLanguage,
        isOnboardingRead: isOnboardingRead,
        palettesView: palettesView,
      },
    })})`
  )

  return true
}

export default checkUserPreferences
