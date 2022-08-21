import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import { useState } from "react";

const Item = styled(Paper)(({ theme }) => ({
   backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
   ...theme.typography.body2,
   padding: theme.spacing(1),
   textAlign: "center",
   color: theme.palette.text.secondary
}));

function DisplayCaps(props) {
   const refreshRate = parseInt(props.refreshRate);
   const fpsLimit = parseInt(props.fpsLimit);

   if (
      isNaN(fpsLimit) ||
      isNaN(refreshRate) ||
      refreshRate < 1 ||
      fpsLimit < 1
   ) {
      return;
   }

   const viableFpsCaps = new Set();
   let multiplier = 1;
   let divider = 1;
   let cap;

   while (true) {
      cap = refreshRate * multiplier;

      if (cap > fpsLimit) {
         break;
      }

      if (cap >= 1) {
         viableFpsCaps.add(cap);
      }

      multiplier += 1;
   }

   while (true) {
      if (refreshRate % divider === 0) {
         cap = refreshRate / divider;

         if (cap < 1) {
            break;
         }

         if (cap <= fpsLimit) {
            viableFpsCaps.add(cap);
         }

         if (cap === 1) {
            break;
         }
      }

      divider += 1;
   }

   const sortedFpsCaps = [...viableFpsCaps].sort((a, b) => a - b);

   return (
      <Box sx={{ flexGrow: 1 }}>
         <Grid container spacing={1}>
            {sortedFpsCaps.map((fps) => (
               <Grid key={fps} item xs={2}>
                  <Item>{fps}</Item>
               </Grid>
            ))}
         </Grid>
      </Box>
   );
}

export default function FPSCap() {
   const [refreshRate, setRefreshRate] = useState(240);
   const [fpsLimit, setFpsLimit] = useState(1000);

   return (
      <Container className="container" maxWidth="xs">
         <Stack spacing={2}>
            <TextField
               label="Monitor Refresh Rate"
               variant="outlined"
               type="number"
               value={refreshRate}
               onChange={(ev) => setRefreshRate(ev.target.value)}
            />
            <TextField
               label="FPS Limit"
               variant="outlined"
               type="number"
               value={fpsLimit}
               onChange={(ev) => setFpsLimit(ev.target.value)}
            />
            <DisplayCaps refreshRate={refreshRate} fpsLimit={fpsLimit} />
         </Stack>
      </Container>
   );
}
