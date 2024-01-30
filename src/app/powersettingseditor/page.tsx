import type { Metadata } from "next";
import Editor from "./components/Editor";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Windows Power Settings Editor",
  description: "Windows Power Settings Editor",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "Windows Power Settings Editor",
    description: "Windows Power Settings Editor",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "Windows Power Settings Editor",
    description: "Windows Power Settings Editor",
    images: "/icon.png",
    card: "summary",
  },
};

export default function PowerSettingsEditor() {
  return <Editor />;
}
