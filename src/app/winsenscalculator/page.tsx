import type { Metadata } from "next";
import Calculator from "./components/Calculator";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Windows Sensitivity Calculator",
  description: "Windows Sensitivity Calculator",
  metadataBase: new URL("https://boringboredom.github.io/tools"),
  openGraph: {
    title: "Windows Sensitivity Calculator",
    description: "Windows Sensitivity Calculator",
    images: "/icon.png",
    type: "website",
  },
  twitter: {
    title: "Windows Sensitivity Calculator",
    description: "Windows Sensitivity Calculator",
    images: "/icon.png",
    card: "summary",
  },
};

export default function WinSensCalculator() {
  return <Calculator />;
}
