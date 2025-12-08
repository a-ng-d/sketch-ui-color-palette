import { createRoot } from 'react-dom/client'
import React from 'react'
import mixpanel from 'mixpanel-browser'
import App from '@ui-lib/ui/App'
import { initTolgee } from '@ui-lib/external/translation'
import {
  initMixpanel,
  setMixpanelEnv,
  setEditor,
} from '@ui-lib/external/tracking/client'
import { initSentry } from '@ui-lib/external/monitoring'
import { initMistral } from '@ui-lib/external/mistral'
import { initSupabase } from '@ui-lib/external/auth'
import zh_Hans_CN from '@ui-lib/content/translations/zh-Hans-CN.json'
import pt_BR from '@ui-lib/content/translations/pt-BR.json'
import fr_FR from '@ui-lib/content/translations/fr-FR.json'
import en_US from '@ui-lib/content/translations/en-US.json'
import { ThemeProvider } from '@ui-lib/config/ThemeContext'
import { ConfigProvider } from '@ui-lib/config/ConfigContext'
import { TolgeeProvider } from '@tolgee/react'
import * as Sentry from '@sentry/react'
import globalConfig from '../src/global.config'

const container = document.getElementById('app'),
  root = createRoot(container)

// eslint-disable-next-line no-undef
const mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN
// eslint-disable-next-line no-undef
const sentryDsn = process.env.REACT_APP_SENTRY_DSN
// eslint-disable-next-line no-undef
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLIC_ANON_KEY
// eslint-disable-next-line no-undef
const mistralApiKey = process.env.REACT_APP_MISTRAL_AI_API_KEY
// eslint-disable-next-line no-undef
const tolgeeUrl = process.env.REACT_APP_TOLGEE_URL
// eslint-disable-next-line no-undef
const tolgeeApiKey = process.env.REACT_APP_TOLGEE_API_KEY

// Mixpanel
if (globalConfig.env.isMixpanelEnabled && mixpanelToken !== undefined) {
  mixpanel.init(mixpanelToken, {
    api_host: 'https://api-eu.mixpanel.com',
    debug: globalConfig.env.isDev,
    disable_persistence: true,
    disable_cookie: true,
    ignore_dnt: true,
    opt_out_tracking_by_default: true,
    record_sessions_percent: 5,
    record_mask_text_selector: '*',
    record_block_selector: 'img',
    record_heatmap_data: true,
  })
  mixpanel.opt_in_tracking()

  // eslint-disable-next-line no-undef
  setMixpanelEnv(process.env.NODE_ENV)
  initMixpanel(mixpanel)
  setEditor(globalConfig.env.editor)
}

// Sentry
if (
  globalConfig.env.isSentryEnabled &&
  !globalConfig.env.isDev &&
  sentryDsn !== undefined
) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    initialScope: {
      tags: {
        platform: globalConfig.env.platform,
        version: globalConfig.env.pluginVersion,
      },
    },
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        autoInject: false,
      }),
    ],
    attachStacktrace: true,
    normalizeDepth: 15,
    maxValueLength: 5000,
    maxBreadcrumbs: 150,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    release: globalConfig.env.pluginVersion,
  })

  initSentry(Sentry)
} else {
  const devLogger = {
    captureException: (error) => {
      console.group('🐛 Dev Error Logger')
      console.error(error)
      console.groupEnd()
    },
    captureMessage: (message) => {
      console.group('📝 Dev Message Logger')
      console.info(message)
      console.groupEnd()
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.Sentry = devLogger
}

// Supabase
if (globalConfig.env.isSupabaseEnabled && supabaseAnonKey !== undefined)
  initSupabase(globalConfig.urls.databaseUrl, supabaseAnonKey)

// Mistral AI
if (globalConfig.env.isMistralAiEnabled) initMistral(mistralApiKey)

// Tolgee
const tolgee = initTolgee(tolgeeUrl, tolgeeApiKey, globalConfig.lang, {
  'en-US': en_US,
  'fr-FR': fr_FR,
  'pt-BR': pt_BR,
  'zh-Hans-CN': zh_Hans_CN,
})

// Bridge Canvas <> UI
window.sendData = (data) => {
  const pluginEvent = new CustomEvent('platformMessage', {
    detail: data,
  })
  window.dispatchEvent(pluginEvent)
}

window.addEventListener('pluginMessage', (event) => {
  const { message } = event.detail
  window.postMessage(message.pluginMessage.type, message.pluginMessage)
})

// Render
tolgee?.run().then(() => {
  root.render(
    <TolgeeProvider
      tolgee={tolgee}
      fallback="Loading..."
    >
      <ConfigProvider
        limits={globalConfig.limits}
        env={globalConfig.env}
        plan={globalConfig.plan}
        dbs={globalConfig.dbs}
        urls={globalConfig.urls}
        versions={globalConfig.versions}
        features={globalConfig.features}
        lang={globalConfig.lang}
        fees={globalConfig.fees}
      >
        <ThemeProvider
          theme={globalConfig.env.ui}
          mode={globalConfig.env.colorMode}
        >
          <App />
        </ThemeProvider>
      </ConfigProvider>
    </TolgeeProvider>
  )
})
