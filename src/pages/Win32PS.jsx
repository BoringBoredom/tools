import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";

import { useState } from "react";

function calculateQuantum(decimal, consumerChecked) {
   if (decimal === "") {
      return "";
   }

   const clippedBinary = decimal.toString(2).padStart(32, "0").slice(26);

   let foreGround = 6;
   let backGround = 6;

   const firstTwo = clippedBinary.slice(0, 2);
   const secondTwo = clippedBinary.slice(2, 4);
   const thirdTwo = clippedBinary.slice(4);

   if (
      firstTwo === "01" ||
      (!consumerChecked && (firstTwo === "00" || firstTwo === "11"))
   ) {
      foreGround = backGround = 12;
   }

   if (
      secondTwo === "10" ||
      (!consumerChecked && (secondTwo === "00" || secondTwo === "11"))
   ) {
      foreGround = backGround = foreGround * 3;
   } else if (thirdTwo === "01") {
      foreGround *= 2;
   } else if (thirdTwo === "10" || thirdTwo === "11") {
      foreGround *= 3;
   }

   return `FG ${foreGround} : ${backGround} BG`;
}

export default function Win32PS() {
   const [decimal, setDecimal] = useState(2);
   const [consumerChecked, setConsumerChecked] = useState(true);

   function handleDecChange(ev) {
      let input = ev.target.value;

      if (input === "") {
         return setDecimal("");
      }

      input = parseInt(input);

      if (input >= 0 && input <= 4294967295) {
         setDecimal(input);
      }
   }

   function handleHexChange(ev) {
      let input = ev.target.value;

      if (
         input.length > 8 ||
         input.split("").some((char) => {
            return !char.match(/[a-fA-F0-9]/);
         })
      ) {
         return;
      }

      setDecimal(input === "" ? "" : parseInt(input, 16));
   }

   function handleBinaryChange(ev) {
      let input = ev.target.value;

      if (
         input.length > 32 ||
         input.split("").some((char) => {
            return !(char === "0" || char === "1");
         })
      ) {
         return;
      }

      setDecimal(input === "" ? "" : parseInt(input, 2));
   }

   return (
      <Container className="container" maxWidth="xs">
         <Stack spacing={2}>
            <TextField
               id="decimal"
               label="Decimal"
               variant="outlined"
               type="number"
               value={decimal}
               fullWidth={true}
               onChange={handleDecChange}
            />
            <TextField
               id="hexadecimal"
               label="Hexadecimal"
               variant="outlined"
               value={decimal.toString(16).toUpperCase() || ""}
               fullWidth={true}
               onChange={handleHexChange}
            />
            <TextField
               id="binary"
               label="Binary"
               variant="outlined"
               value={decimal.toString(2)}
               fullWidth={true}
               onChange={handleBinaryChange}
            />
            <div>
               Server
               <Switch
                  checked={consumerChecked}
                  onChange={() => setConsumerChecked(!consumerChecked)}
               />
               Consumer
            </div>
            <div style={{ fontSize: "xxx-large" }}>
               {calculateQuantum(decimal, consumerChecked)}
            </div>
         </Stack>
      </Container>
   );
}
