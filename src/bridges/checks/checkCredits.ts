import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'
import globalConfig from '../../global.config'

const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

// Calendar month addition, clamping day overflow (Jan 31 + 1 month = Feb 28/29)
const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime())
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

const checkCredits = async () => {
  let creditsCount = Settings.settingForKey('credits_count')
  let renewDate = Settings.settingForKey('credits_renew_date')
  const creditsVersion = Settings.settingForKey('credits_version')

  const now = new Date()

  const periodMonths = globalConfig.plan.creditsRenewalPeriodMonths
  const periodHours =
    globalConfig.plan.creditsRenewalPeriodHours ??
    globalConfig.plan.creditsRenewalPeriodDays * 24

  const computeNext = (from: Date) =>
    periodMonths !== undefined
      ? addMonths(from, periodMonths)
      : addHours(from, periodHours)

  if (renewDate === undefined) {
    const next = computeNext(now)
    Settings.setSettingForKey('credits_renew_date', next.getTime())
    renewDate = next.getTime()
  }

  if (renewDate <= now.getTime()) {
    Settings.setSettingForKey('credits_count', globalConfig.plan.creditsLimit)
    const next = computeNext(now)
    Settings.setSettingForKey('credits_renew_date', next.getTime())
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsCount === undefined) {
    Settings.setSettingForKey('credits_count', globalConfig.plan.creditsLimit)
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsVersion !== globalConfig.versions.creditsVersion.toString()) {
    Settings.setSettingForKey(
      'credits_version',
      globalConfig.versions.creditsVersion
    )
    Settings.setSettingForKey(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = computeNext(now)
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
