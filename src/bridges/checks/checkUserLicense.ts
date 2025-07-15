import Settings from "sketch/settings";
import { getWebContents } from "../../utils/webContents";

const checkUserLicense = async () => {
  const licenseKey = Settings.globalSettingForKey("user_license_key");
  const instanceId = Settings.globalSettingForKey("user_license_instance_id");

  if (licenseKey !== undefined && instanceId !== undefined)
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: "CHECK_USER_LICENSE",
        data: {
          licenseKey: licenseKey,
          instanceId: instanceId,
        },
      })})`
    );
  return true;
};

export default checkUserLicense;
