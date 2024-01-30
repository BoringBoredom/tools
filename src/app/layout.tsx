import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Navigation from "./components/Navigation/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <MantineProvider defaultColorScheme="dark">
          <Navigation>{children}</Navigation>
        </MantineProvider>
      </body>
    </html>
  );
}
