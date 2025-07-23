import { doSpecificMode } from "@ui-lib/stores/features";
import { Config } from "./types/config";
import { locales } from "../resources/content/locales";

const isDev = process.env.NODE_ENV === "development";

const globalConfig: Config = {
  limits: {
    pageSize: 20,
  },
  env: {
    platform: "sketch",
    editor: "sketch",
    ui: "sketch",
    colorMode: "sketch-dark",
    isDev,
    isSupabaseEnabled: true,
    isMixpanelEnabled: true,
    isSentryEnabled: true,
    announcementsDbId: process.env.REACT_APP_NOTION_ANNOUNCEMENTS_ID as string,
    onboardingDbId: process.env.REACT_APP_NOTION_ONBOARDING_ID as string,
    pluginId: "123456789",
  },
  plan: {
    isProEnabled: true,
    isTrialEnabled: false,
    trialTime: 72,
  },
  dbs: {
    palettesDbTableName: isDev ? "sandbox.palettes" : "palettes",
    palettesStorageName: isDev ? "palette.screenshots" : "palette.screenshots",
  },
  urls: {
    authWorkerUrl: isDev
      ? "http://localhost:8787"
      : (process.env.REACT_APP_AUTH_WORKER_URL as string),
    announcementsWorkerUrl: isDev
      ? "http://localhost:8888"
      : (process.env.REACT_APP_ANNOUNCEMENTS_WORKER_URL as string),
    databaseUrl: process.env.REACT_APP_SUPABASE_URL as string,
    authUrl: isDev
      ? "http://localhost:3000"
      : (process.env.REACT_APP_AUTH_URL as string),
    storeApiUrl: process.env.REACT_APP_LEMONSQUEEZY_URL as string,
    platformUrl: "*",
    uiUrl: isDev
      ? "http://localhost:4400"
      : "https://sketch.ui-color-palette.com",
    documentationUrl: "https://uicp.ylb.lt/docs-sketch-plugin",
    repositoryUrl: "https://uicp.ylb.lt/repository-sketch-plugin",
    communityUrl: "https://uicp.ylb.lt/community",
    supportEmail: "https://uicp.ylb.lt/contact",
    feedbackUrl: "https://uicp.ylb.lt/feedback",
    trialFeedbackUrl: "https://uicp.ylb.lt/feedback-trial",
    requestsUrl: "https://uicp.ylb.lt/ideas",
    networkUrl: "https://uicp.ylb.lt/network",
    authorUrl: "https://uicp.ylb.lt/author",
    licenseUrl: "https://uicp.ylb.lt/license",
    privacyUrl: "https://uicp.ylb.lt/privacy",
    vsCodeFigmaPluginUrl: "https://uicp.ylb.lt/vscode-figma-plugin",
    isbUrl: "https://isb.ylb.lt/website",
    uicpUrl: "https://uicp.ylb.lt/website",
    storeUrl: isDev
      ? "https://uicp.ylb.lt/store-dev"
      : "https://uicp.ylb.lt/store",
    storeManagementUrl: isDev
      ? "https://uicp.ylb.lt/store-management-dev"
      : "https://uicp.ylb.lt/store-management",
  },
  versions: {
    userConsentVersion: "2024.01",
    trialVersion: "2024.03",
    algorithmVersion: "v3",
    paletteVersion: "2025.06",
  },
  features: doSpecificMode(
    [
      "RESIZE_UI",
      "HELP_CHAT",
      "DOCUMENT_PALETTE",
      "DOCUMENT_PALETTE_PROPERTIES",
      "DOCUMENT_SHEET",
      "DOCUMENT_PUSH_UPDATES",
      "DOWNLOAD_EXPORT",
      "EXPORT_CSV",
      "LOCAL_PALETTES_PAGE",
    ],
    [
      "LOCAL_PALETTES",
      "SYNC_LOCAL_STYLES",
      "SYNC_LOCAL_VARIABLES",
      "USER_PREFERENCES_SYNC_DEEP_STYLES",
      "USER_PREFERENCES_SYNC_DEEP_VARIABLES",
      "PREVIEW_LOCK_SOURCE_COLORS",
      "SOURCE",
      "PRESETS_MATERIAL_3",
      "PRESETS_TAILWIND",
      "PRESETS_ADS",
      "PRESETS_ADS_NEUTRAL",
      "PRESETS_CARBON",
      "PRESETS_BASE",
      "PRESETS_POLARIS",
      "PRESETS_CUSTOM_ADD",
      "SCALE_CHROMA",
      "SCALE_HELPER_DISTRIBUTION",
      "THEMES",
      "THEMES_NAME",
      "THEMES_PARAMS",
      "THEMES_DESCRIPTION",
      "COLORS",
      "COLORS_HUE_SHIFTING",
      "COLORS_CHROMA_SHIFTING",
      "COLORS_ALPHA",
      "COLORS_BACKGROUND_COLOR",
      "EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY",
      "EXPORT_TAILWIND",
      "EXPORT_APPLE_SWIFTUI",
      "EXPORT_APPLE_UIKIT",
      "EXPORT_ANDROID_COMPOSE",
      "EXPORT_ANDROID_XML",
      "EXPORT_CSV",
      "SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA",
      "SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY",
      "SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY",
      "SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA",
      "SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY",
      "SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA",
      "SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY",
      "SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA",
    ],
    ["SCALE_CONTRAST_RATIO"]
  ),
  locales: locales.get(),
};

export default globalConfig;
