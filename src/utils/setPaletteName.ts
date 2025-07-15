import { locales } from "../../resources/content/locales";

const setPaletteName = (
  name: string,
  theme: string | undefined,
  preset: string,
  colorSpace: string,
  visionSimulationMode: string
): string => {
  const parameters: Array<string> = [];

  name === "" ? parameters.push(locales.get().name) : parameters.push(name);
  theme === "None" || theme === undefined ? null : parameters.push(theme);
  parameters.push(preset);
  parameters.push(colorSpace);

  if (visionSimulationMode !== "NONE") {
    const mode = visionSimulationMode.toLowerCase();
    const visionModes = locales.get().settings.color.visionSimulationMode;
    if (mode in visionModes)
      parameters.push(visionModes[mode as keyof typeof visionModes]);
  }

  return parameters.join(locales.get().separator);
};

export default setPaletteName;
