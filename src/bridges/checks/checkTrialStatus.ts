import { getWebContents } from "../../utils/webContents";
import globalConfig from "../../global.config";
import Settings from "sketch/settings";

const checkTrialStatus = async () => {
  const trialStartDate =
    Settings.globalSettingForKey("trial_start_date") !== ""
      ? parseFloat(Settings.globalSettingForKey("trial_start_date") || "")
      : null;
  const currentTrialVersion: string =
    Settings.globalSettingForKey("trial_version") ||
    globalConfig.versions.trialVersion;
  const currentTrialTime: number = parseFloat(
    Settings.globalSettingForKey("trial_time") || "72"
  );

  let consumedTime = 0,
    trialStatus = "UNUSED";

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60);

    if (
      consumedTime <= currentTrialTime &&
      currentTrialVersion !== globalConfig.versions.trialVersion &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = "PENDING";
    else if (
      consumedTime >= globalConfig.plan.trialTime &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = "EXPIRED";
    else trialStatus = "UNUSED";
  }

  getWebContents()
    .executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_TRIAL_STATUS",
        data: {
          planStatus:
            trialStatus === "PENDING" || !globalConfig.plan.isProEnabled
              ? "PAID"
              : "UNPAID",
          trialStatus: trialStatus,
          trialRemainingTime: Math.ceil(
            currentTrialVersion !== globalConfig.versions.trialVersion
              ? currentTrialTime - consumedTime
              : globalConfig.plan.trialTime - consumedTime
          ),
        },
      })})`
    )
    .catch(console.error);

  return trialStatus === "PENDING" || !globalConfig.plan.isProEnabled
    ? "PAID"
    : "UNPAID";
};

export default checkTrialStatus;
