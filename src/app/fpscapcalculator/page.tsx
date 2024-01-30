import type { Metadata } from "next";
import Calculator from "./components/Calculator";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "FPS Cap Calculator",
  description: "FPS Cap Calculator",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "FPS Cap Calculator",
    description: "FPS Cap Calculator",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "FPS Cap Calculator",
    description: "FPS Cap Calculator",
    images: "/icon.png",
    card: "summary",
  },
};

export default function FPSCapCalculator() {
  return <Calculator />;
}
