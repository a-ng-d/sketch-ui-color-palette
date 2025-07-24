import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import { userConsent } from '../../utils/userConsent'
import globalConfig from '../../global.config'

const checkUserConsent = async () => {
  const currentUserConsentVersion = Settings.settingForKey(
    'user_consent_version'
  )

  const userConsentData = await Promise.all(
    userConsent.map(async (consent) => {
      return {
        ...consent,
        isConsented: Settings.settingForKey(`${consent.id}_user_consent`),
      }
    })
  )

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_USER_CONSENT',
      data: {
        mustUserConsent:
          currentUserConsentVersion !==
            globalConfig.versions.userConsentVersion ||
          currentUserConsentVersion === undefined,
        userConsent: userConsentData,
      },
    })})`
  )

  return true
}

export default checkUserConsent
