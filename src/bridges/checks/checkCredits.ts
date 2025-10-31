import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import globalConfig from '../../global.config'

const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

const checkCredits = async () => {
  let creditsCount = Settings.settingForKey('credits_count')
  let renewDate = Settings.settingForKey('credits_renew_date')
  const creditsVersion =
    Settings.settingForKey('credits_version') ||
    globalConfig.versions.creditsVersion

  const now = new Date()

  const periodHours =
    globalConfig.plan.creditsRenewalPeriodHours ??
    globalConfig.plan.creditsRenewalPeriodDays * 24

  if (renewDate === undefined) {
    const next = addHours(now, periodHours)
    Settings.setSettingForKey('credits_renew_date', next.getTime())
    renewDate = next.getTime()
  }

  if (renewDate <= now.getTime()) {
    Settings.setSettingForKey('credits_count', globalConfig.plan.creditsLimit)
    const next = addHours(now, periodHours)
    Settings.setSettingForKey('credits_renew_date', next.getTime())
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsCount === undefined) {
    Settings.setSettingForKey('credits_count', globalConfig.plan.creditsLimit)
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsVersion !== globalConfig.versions.creditsVersion) {
    Settings.settingForKey(
      'credits_version',
      globalConfig.versions.creditsVersion
    )
    Settings.settingForKey(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = addHours(now, periodHours)
    Settings.setSettingForKey('credits_renew_date', next.getTime())
    creditsCount = globalConfig.plan.creditsLimit
    renewDate = next.getTime()
  }

  getWebContents().executeJavaScript(
    `sendData(${JSON.stringify({
      type: 'CHECK_CREDITS',
      data: {
        creditsCount: creditsCount,
        creditsRenewalDate: renewDate,
      },
    })})`
  )

  return creditsCount
}

export default checkCredits
