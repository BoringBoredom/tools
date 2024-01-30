import type { Metadata } from "next";
import Grapher from "./components/Grapher";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "NVIDIA Latency Grapher",
  description: "NVIDIA Latency Grapher",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "NVIDIA Latency Grapher",
    description: "NVIDIA Latency Grapher",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "NVIDIA Latency Grapher",
    description: "NVIDIA Latency Grapher",
    images: "/icon.png",
    card: "summary",
  },
};

export default function NVIDIALatencyGrapher() {
  return <Grapher />;
}
