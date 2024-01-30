import AppList from "./components/AppList/AppList";
import { Stack } from "@mantine/core";
import type { Metadata } from "next";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Tools",
  description: "miscellaneous tools",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "Tools",
    description: "miscellaneous tools",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "Tools",
    description: "miscellaneous tools",
    images: "/icon.png",
    card: "summary",
  },
};

export default function Home() {
  return (
    <Stack gap="xs">
      <AppList />
    </Stack>
  );
}
