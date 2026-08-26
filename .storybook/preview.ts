import type { Preview } from "@storybook/react-vite";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        sinbinCompact: { name: "SINBIN Compact 667×375", styles: { width: "667px", height: "375px" }, type: "mobile" },
        sinbinReference: { name: "SINBIN Reference 844×390", styles: { width: "844px", height: "390px" }, type: "mobile" },
        sinbinLarge: { name: "SINBIN Large 915×412", styles: { width: "915px", height: "412px" }, type: "mobile" },
      },
    },
    backgrounds: { default: "SINBIN navy", values: [{ name: "SINBIN navy", value: "#06151e" }] },
  },
};

export default preview;
