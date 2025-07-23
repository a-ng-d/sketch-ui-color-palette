import Settings from 'sketch/settings'
import { getWebContents } from '../../utils/webContents'

const checkAnnouncementsStatus = (remoteVersion: string) => {
  const localVersion = Settings.settingForKey('announcements_version')
  const isOnboardingRead = Settings.settingForKey('is_onboarding_read')

  if (localVersion === undefined && remoteVersion === undefined)
    return {
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'NO_ANNOUNCEMENTS',
      },
    }
  else if (localVersion === undefined && isOnboardingRead === undefined) {
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'PUSH_ONBOARDING_STATUS',
        data: {
          status: 'DISPLAY_ONBOARDING_DIALOG',
        },
      })})`
    )
    return {
      type: 'PUSH_ONBOARDING_STATUS',
      data: {
        status: 'DISPLAY_ONBOARDING_DIALOG',
      },
    }
  } else if (localVersion === '') {
    getWebContents().executeJavaScript(
      `sendData(${JSON.stringify({
        type: 'PUSH_ANNOUNCEMENTS_STATUS',
        data: {
          status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
        },
      })})`
    )
    return {
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
      },
    }
  } else {
    const remoteMajorVersion = remoteVersion.split('.')[0],
      remoteMinorVersion = remoteVersion.split('.')[1]

    const localMajorVersion = localVersion?.split('.')[0],
      localMinorVersion = localVersion?.split('.')[1]

    if (remoteMajorVersion !== localMajorVersion) {
      getWebContents().executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'PUSH_ANNOUNCEMENTS_STATUS',
          data: {
            status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
          },
        })})`
      )
      return {
        type: 'PUSH_ANNOUNCEMENTS_STATUS',
        data: {
          status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
        },
      }
    }

    if (remoteMinorVersion !== localMinorVersion) {
      getWebContents().executeJavaScript(
        `sendData(${JSON.stringify({
          type: 'PUSH_ANNOUNCEMENTS_STATUS',
          data: {
            status: 'DISPLAY_ANNOUNCEMENTS_NOTIFICATION',
          },
        })})`
      )
      return {
        type: 'PUSH_ANNOUNCEMENTS_STATUS',
        data: {
          status: 'DISPLAY_ANNOUNCEMENTS_NOTIFICATION',
        },
      }
    }

    return {
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'NO_ANNOUNCEMENTS',
      },
    }
  }
}

export default checkAnnouncementsStatus
