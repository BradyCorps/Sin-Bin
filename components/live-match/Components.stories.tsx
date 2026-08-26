import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionCard, ActiveCard, BenchCard, CausalCall, DisruptionPanel } from "./LiveMatchUi";

const meta = { title: "LiveMatch/Components", parameters: { layout: "centered" } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const ActiveCardStory: Story = { name: "ActiveCard", render: () => <div className="sinbin-isolated active"><ActiveCard role="CREATE" name="SABLE" energy={5} maximum={8} preview="bridge" caption="RELAY WINDOW OPEN" /></div> };
export const BenchCardStory: Story = { name: "BenchCard", render: () => <div className="sinbin-isolated bench"><BenchCard /></div> };
export const DisruptionPanelStory: Story = { name: "DisruptionPanel", render: () => <div className="sinbin-isolated disruption"><DisruptionPanel /></div> };
export const CausalCallStory: Story = { name: "CausalCall", render: () => <CausalCall /> };
export const ActionCardStory: Story = { name: "ActionCard", render: () => <div className="sinbin-isolated action"><ActionCard /></div> };
