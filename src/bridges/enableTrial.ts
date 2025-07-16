import Settings from "sketch/settings";
import { getWebContents } from "../utils/webContents";

const enableTrial = async (trialTime: number, trialVersion: string) => {
  const now = new Date().getTime();

  Settings.setSettingForKey("trial_start_date", now.toString());
  Settings.setSettingForKey("trial_version", trialVersion);
  Settings.setSettingForKey("trial_time", trialTime.toString());

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: "ENABLE_TRIAL",
      data: {
        date: now,
        trialTime: trialTime,
      },
    })})`
  );
};

export default enableTrial;
