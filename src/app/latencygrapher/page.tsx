import type { Metadata } from "next";
import Grapher from "./components/Grapher";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Latency Grapher",
  description: "Latency Grapher",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "Latency Grapher",
    description: "Latency Grapher",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "Latency Grapher",
    description: "Latency Grapher",
    images: "/icon.png",
    card: "summary",
  },
};

export default function LatencyGrapher() {
  return <Grapher />;
}
