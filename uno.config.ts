import { defineConfig } from "unocss";
import presetWind from "unocss/preset-wind4";
import typography from "unocss/preset-typography";

export default defineConfig({
  presets: [presetWind(), typography()],
});
