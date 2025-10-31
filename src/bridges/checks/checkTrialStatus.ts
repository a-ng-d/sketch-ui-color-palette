import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import globalConfig from '../../global.config'

const checkTrialStatus = async (webContents?: any) => {
  const trialStartDate = Settings.settingForKey('trial_start_date')
  const currentTrialVersion =
    Settings.settingForKey('trial_version') ||
    globalConfig.versions.trialVersion
  const currentTrialTime = Settings.settingForKey('trial_time')

  const sharedWebContents =
    webContents === undefined ? getWebContents() : webContents

  let consumedTime = 0,
    trialStatus = 'UNUSED'

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60)

    if (
      consumedTime <= currentTrialTime &&
      currentTrialVersion !== globalConfig.versions.trialVersion &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = 'PENDING'
    else if (
      consumedTime >= globalConfig.plan.trialTime &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = 'EXPIRED'
    else trialStatus = 'UNUSED'
  }

  let planStatus

  if (trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled)
    planStatus = 'PAID'
  else planStatus = undefined

  sharedWebContents.executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_TRIAL_STATUS',
      data: {
        planStatus: planStatus,
        trialStatus: trialStatus,
        trialRemainingTime: Math.ceil(
          currentTrialVersion !== globalConfig.versions.trialVersion
            ? currentTrialTime - consumedTime
            : globalConfig.plan.trialTime - consumedTime
        ),
      },
    })})`
  )

  if (trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled)
    return 'PAID'
  else return undefined
}

export default checkTrialStatus
