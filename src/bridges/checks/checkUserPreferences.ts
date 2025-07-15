import { Language } from '../../types/translations'
import { locales } from "../../../resources/content/locales";
import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const checkUserPreferences = async () => {
  const isWCAGDisplayed = Settings.globalSettingForKey("is_wcag_displayed");
  const isAPCADisplayed = Settings.globalSettingForKey("is_apca_displayed");
  const canDeepSyncStyles = Settings.globalSettingForKey(
    "can_deep_sync_styles"
  );
  const canDeepSyncVariables = Settings.globalSettingForKey(
    "can_deep_sync_variables"
  );
  const isVsCodeMessageDisplayed = Settings.globalSettingForKey(
    "is_vscode_message_displayed"
  );
  const userLanguage = Settings.globalSettingForKey("user_language");

  if (isWCAGDisplayed === undefined)
    Settings.setGlobalSettingForKey("is_wcag_displayed", true);

  if (isAPCADisplayed === undefined)
    Settings.setGlobalSettingForKey("is_apca_displayed", true);

  if (canDeepSyncStyles === undefined)
    Settings.setGlobalSettingForKey("can_deep_sync_styles", false);

  if (canDeepSyncVariables === undefined)
    Settings.setGlobalSettingForKey("can_deep_sync_variables", false);

  if (isVsCodeMessageDisplayed === undefined)
    Settings.setGlobalSettingForKey("is_vscode_message_displayed", true);

  if (userLanguage === undefined)
    Settings.setGlobalSettingForKey("user_language", "en-US");

  locales.set((userLanguage as Language) ?? "en-US");

  getWebContents()
    .executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_USER_PREFERENCES",
        data: {
          isWCAGDisplayed: isWCAGDisplayed,
          isAPCADisplayed: isAPCADisplayed,
          canDeepSyncStyles: canDeepSyncStyles,
          canDeepSyncVariables: canDeepSyncVariables,
          isVsCodeMessageDisplayed:
            isVsCodeMessageDisplayed === undefined
              ? true
              : isVsCodeMessageDisplayed,
          userLanguage: userLanguage ?? "en-US",
        },
      })})`
    )
    .catch(console.error);

  return true;
};

export default checkUserPreferences
