import { tolgee } from '../runUicp'

const setPaletteName = (
  name: string,
  theme: string | undefined,
  preset: string,
  colorSpace: string,
  visionSimulationMode: string
): string => {
  const parameters: Array<string> = []

  if (name === '') parameters.push(tolgee.t('name'))
  else parameters.push(name)

  if (theme !== 'None' && theme !== undefined) parameters.push(theme)

  parameters.push(preset)
  parameters.push(colorSpace)

  if (visionSimulationMode !== 'NONE') {
    const mode = visionSimulationMode.toLowerCase()
    const key = `settings.color.visionSimulationMode.${mode}`
    parameters.push(tolgee.t(key))
  }

  return parameters.join(tolgee.t('separator'))
}

export default setPaletteName
