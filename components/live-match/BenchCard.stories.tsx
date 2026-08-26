import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectedViolettaBenchCard } from "./BenchCardSkin";

const meta = {
  title: "LiveMatch/Components/BenchCard",
  component: SelectedViolettaBenchCard,
  parameters: { layout: "fullscreen" },
  args: {
    selected: true,
    currentEnergy: 8,
    maximumEnergy: 8,
    playerName: "VIOLETTA",
    rolePrimary: "BRIDGE",
    roleSecondary: "FLEX",
  },
  argTypes: {
    selected: { control: "boolean" },
    currentEnergy: { control: { type: "number", min: 0, max: 12, step: 1 } },
    maximumEnergy: { control: { type: "number", min: 1, max: 12, step: 1 } },
    playerName: { control: "text" },
    rolePrimary: { control: "text" },
    roleSecondary: { control: "text" },
  },
} satisfies Meta<typeof SelectedViolettaBenchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedViolettaSkinV01: Story = {
  name: "Approved Baseline — BenchCard v0.1",
  render: (args) => <main className="sb-skin-proof-stage">
    <h1 className="sb-skin-visually-hidden">Approved Baseline — BenchCard v0.1</h1>
    <SelectedViolettaBenchCard {...args} />
  </main>,
};
