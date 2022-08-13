import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import { useState } from "react";


const sensitivities = [
   [1 / 32, "1/32", "1/11"],
   [1 / 16, "1/16", "2/11"],
   [1 / 8, "1/8"],
   [2 / 8, "2/8", "3/11"],
   [3 / 8, "3/8"],
   [4 / 8, "4/8", "4/11"],
   [5 / 8, "5/8"],
   [6 / 8, "6/8", "5/11"],
   [7 / 8, "7/8"],
   [1, "1", "6/11"],
   [1.25, "1.25"],
   [1.5, "1.5", "7/11"],
   [1.75, "1.75"],
   [2, "2", "8/11"],
   [2.25, "2.25"],
   [2.5, "2.5", "9/11"],
   [2.75, "2.75"],
   [3, "3", "10/11"],
   [3.25, "3.25"],
   [3.5, "3.5", "11/11"]
];

function DisplayDpi(props) {
   const dpi = props.efDpi / props.multiplier;

   if (Number.isInteger(dpi)) {
      return dpi;
   }

   return (
      <Tooltip title={<h2>rounded to the nearest integer</h2>}>
         <div>
            *{Math.round(dpi)}
         </div>
      </Tooltip>
   );
}

export default function WinSens() {
   const [efDpi, setEfDpi] = useState(1600);

   function handleEfDpiChange(ev) {
      let input = ev.target.value;

      if (input === "") {
         return setEfDpi("");
      }

      input = parseInt(input);

      if (input >= 0) {
         setEfDpi(input);
      }
   }

   return (
      <Container
         className="container"
         maxWidth="xs"
      >
         <div>
            <Tooltip title={<h2>DPI you'd normally use @ stock setting (New Panel: 10/20 or Legacy Panel: 6/11)</h2>}>
               <TextField
                  id="efDpi"
                  label="*eDPI (DPI @ stock)"
                  variant="outlined"
                  type="number"
                  value={efDpi}
                  onChange={handleEfDpiChange}
               />
            </Tooltip>
         </div>
         <div className="row">
            <TableContainer component={Paper}>
               <Table size="small">
                  <TableHead>
                     <TableRow>
                        <TableCell align="right">
                           DPI
                        </TableCell>
                        <TableCell align="right">
                           <Tooltip title={<h2>HKEY_CURRENT_USER\Control Panel\Mouse -{">"} MouseSensitivity</h2>}>
                              <div>
                                 *Registry / New Panel
                              </div>
                           </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                           Legacy Panel
                        </TableCell>
                        <TableCell align="right">
                           Multiplier
                        </TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {sensitivities.map((row, index) => (
                        <TableRow
                           key={index}
                           sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                           <TableCell align="right">
                              <DisplayDpi efDpi={efDpi} multiplier={row[0]} />
                           </TableCell>
                           <TableCell align="right">
                              {index + 1}
                           </TableCell>
                           <TableCell align="right">
                              {row[2] === undefined ? "-" : row[2]}
                           </TableCell>
                           <TableCell align="right">
                              {row[1]}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </TableContainer>
         </div>
      </Container>
   );
}