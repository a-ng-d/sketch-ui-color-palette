import { userConsent } from '../../utils/userConsent'
import globalConfig from '../../global.config'
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const checkUserConsent = async () => {
  const currentUserConsentVersion = Settings.globalSettingForKey(
    "user_consent_version"
  );

  const userConsentData = await Promise.all(
    userConsent.map(async (consent) => {
      return {
        ...consent,
        isConsented:
          Settings.globalSettingForKey(`${consent.id}_user_consent`) === "true",
      };
    })
  );

  getWebContents()
    .executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_USER_CONSENT",
        data: {
          mustUserConsent:
            currentUserConsentVersion !==
              globalConfig.versions.userConsentVersion ||
            currentUserConsentVersion === undefined,
          userConsent: userConsentData,
        },
      })})`
    )
    .catch(console.error);

  return true;
};

export default checkUserConsent
