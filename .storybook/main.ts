import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: ["../public"],
  viteFinal: async (viteConfig) => {
    const withoutRsc = (plugins: typeof viteConfig.plugins) => plugins?.flat(Infinity).filter((plugin) => plugin && !plugin.name?.includes("rsc"));
    return {
      ...viteConfig,
      configFile: false,
      // Storybook renders client-only components; vinext's RSC environments are
      // specific to the application build and cannot produce a Storybook bundle.
      plugins: withoutRsc(viteConfig.plugins),
      environments: undefined,
    };
  },
};

export default config;
