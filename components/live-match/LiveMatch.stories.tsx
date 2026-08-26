import type { Meta, StoryObj } from "@storybook/react-vite";
import { CanonicalArtDirectionFixture } from "./CanonicalFixture";

const meta = { title: "LiveMatch", component: CanonicalArtDirectionFixture, parameters: { viewport: { defaultViewport: "sinbinReference" } } } satisfies Meta<typeof CanonicalArtDirectionFixture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CanonicalViolettaSubstitutionPreview: Story = { name: "01 · Violetta substitution preview" };
