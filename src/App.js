import "./App.css";

import Nav from "./pages/Nav";
import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import Win32PS from "./pages/Win32PS";
import WinSens from "./pages/WinSens";
import FPSCap from "./pages/FPSCap";
import RLA from "./pages/RLA";

import { Routes, Route } from "react-router-dom";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";


const pages = [
   ["Win32PS", "Win32PrioritySeparation Calculator"],
   ["WinSens", "Windows Sensitivity Calculator"],
   ["FPSCap", "FPS Cap Calculator"],
   ["RLA", "Reflex Latency Analyzer Grapher"]
]

const pageComponents = [
   <Win32PS />,
   <WinSens />,
   <FPSCap />,
   <RLA />
]

export default function App() {
   const theme = createTheme({
      palette: {
         mode: "dark"
      }
   });

   return (
      <ThemeProvider theme={theme}>
         <Nav pages={pages} />
         <CssBaseline />
         <Routes>
            <Route
               path="/"
               element={<Home pages={pages} />}
            />
            {pages.map((page, index) =>
               <Route
                  key={page[0]}
                  path={page[0]}
                  element={pageComponents[index]}
               />
            )}
            <Route
               path="*"
               element={<PageNotFound />}
            />
         </Routes>
      </ThemeProvider>
   );
}