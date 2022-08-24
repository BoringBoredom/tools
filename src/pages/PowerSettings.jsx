import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useRef, useState } from "react";

import { saveAs } from "file-saver";

function parsePlan(data) {
   data = data.split("\n");

   const plan = { settings: [] };

   let powerScheme;
   let subgroup;
   let subgroupAlias;
   let powerSetting;
   let sixSpaces;
   let powerSettingIndex;

   let sixSpacesState;
   let isAc = true;
   let currentSubgroup;
   let settingOptionIndex = 0;

   let setting = {};
   let index = 0;

   for (const line of data) {
      powerScheme = line.match(/^\S.+: (\S+) {2}\((.+)\)$/m);
      subgroup = line.match(/^ {2}\S.+: (\S+) {2}\((.+)\)$/m);
      subgroupAlias = line.match(/^ {4}\S.+: (?!0x)(\S+)$/m);
      powerSetting = line.match(/^ {4}\S.+: (\S+) {2}\((.+)\)$/m);
      sixSpaces = line.match(/^ {6}\S.+: (.+)$/m);
      powerSettingIndex = line.match(/^ {4}\S.+: (0x\S+)$/m);

      if (powerScheme) {
         plan.powerScheme = { guid: powerScheme[1], name: powerScheme[2] };
      } else if (subgroup) {
         currentSubgroup = { guid: subgroup[1], name: subgroup[2] };
      } else if (subgroupAlias) {
         currentSubgroup.alias = subgroupAlias[1];
      } else if (powerSetting) {
         setting.guid = powerSetting[1];
         setting.name = powerSetting[2];
      } else if (sixSpaces) {
         const result = sixSpaces[1];

         if (!sixSpacesState) {
            if (sixSpaces[0].includes("GUID")) {
               setting.alias = result;
            } else if (result === "000") {
               setting.options = [{ index: 0 }];
               sixSpacesState = "optionName";
            } else if (result.startsWith("0x")) {
               setting.range = { min: parseInt(result, 16) };
               sixSpacesState = "max";
            }
         } else if (sixSpacesState === "optionName") {
            setting.options[settingOptionIndex++].name = result;
            sixSpacesState = "optionIndex";
         } else if (sixSpacesState === "optionIndex") {
            setting.options[settingOptionIndex] = { index: settingOptionIndex };
            sixSpacesState = "optionName";
         } else if (sixSpacesState === "max") {
            setting.range.max = parseInt(result, 16);
            sixSpacesState = "increment";
         } else if (sixSpacesState === "increment") {
            setting.range.increment = parseInt(result, 16);
            sixSpacesState = "unit";
         } else if (sixSpacesState === "unit") {
            setting.range.unit = result;
         }
      } else if (powerSettingIndex) {
         if (isAc) {
            setting.ac = parseInt(powerSettingIndex[1], 16);
            isAc = false;
         } else {
            setting.dc = parseInt(powerSettingIndex[1], 16);
            isAc = true;

            setting.subgroup = currentSubgroup;
            setting.index = index++;
            plan.settings.push(setting);
            setting = {};
         }

         sixSpacesState = undefined;
         settingOptionIndex = 0;
      }
   }

   return plan;
}

function PossibleValues(props) {
   const setting = props.setting;

   if (setting.options) {
      return setting.options.map((option) => (
         <div key={option.index}>{option.name}</div>
      ));
   } else if (setting.range) {
      return (
         <>
            <div>Min: {setting.range.min}</div>
            <div>Max: {setting.range.max}</div>
            <div>Step: {setting.range.increment}</div>
            <div>Unit: {setting.range.unit}</div>
         </>
      );
   } else {
      return "?";
   }
}

function saveFile(data) {
   const powerSchemeGuid = "00000000-0000-0000-0000-000000000000";

   let batch =
      `powercfg /duplicatescheme scheme_current ${powerSchemeGuid}\n` +
      `powercfg /changename ${powerSchemeGuid} "${data.powerScheme.name}"\n` +
      `powercfg /setactive ${powerSchemeGuid}\n\n`;

   for (const setting of data.settings) {
      batch +=
         `@echo ${setting.name} (${setting.subgroup.name})\n` +
         `powercfg /setacvalueindex scheme_current ${setting.subgroup.guid} ${setting.guid} ${setting.ac}\n` +
         `powercfg /setdcvalueindex scheme_current ${setting.subgroup.guid} ${setting.guid} ${setting.dc}\n\n`;
   }

   saveAs(new Blob([batch]), `${data.powerScheme.name}.bat`);
}

export default function PowerSettings() {
   const data = useRef();
   const filePicker = useRef();
   const [ready, setReady] = useState(false);

   function Values(props) {
      const setting = props.setting;

      if (setting.options) {
         return (
            <>
               <div style={{ marginBottom: "15px" }}>
                  <FormControl fullWidth size="small">
                     <InputLabel id="ac-label">AC</InputLabel>
                     <Select
                        labelId="ac-label"
                        defaultValue={setting.options[setting.ac].index}
                        label="AC"
                        onChange={(ev) =>
                           (data.current.settings[setting.index].ac =
                              ev.target.value)
                        }
                     >
                        {setting.options.map((option) => (
                           <MenuItem key={option.index} value={option.index}>
                              {option.name}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </div>
               <div>
                  <FormControl fullWidth size="small">
                     <InputLabel id="dc-label">DC</InputLabel>
                     <Select
                        labelId="dc-label"
                        defaultValue={setting.options[setting.dc].index}
                        label="DC"
                        onChange={(ev) =>
                           (data.current.settings[setting.index].dc =
                              ev.target.value)
                        }
                     >
                        {setting.options.map((option) => (
                           <MenuItem key={option.index} value={option.index}>
                              {option.name}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </div>
            </>
         );
      } else if (setting.range) {
         return (
            <>
               <TextField
                  fullWidth
                  size="small"
                  label="AC"
                  variant="outlined"
                  type="number"
                  defaultValue={setting.ac}
                  onChange={(ev) => {
                     const min = setting.range.min;
                     const max = setting.range.max;
                     let value = ev.target.value;

                     if (value < min) {
                        ev.target.value = min;
                     } else if (value > max) {
                        ev.target.value = max;
                     } else {
                        ev.target.value =
                           value - ((value - min) % setting.range.increment);
                     }

                     data.current.settings[setting.index].ac = ev.target.value;
                  }}
                  style={{ marginBottom: "15px" }}
               />
               <TextField
                  fullWidth
                  size="small"
                  label="DC"
                  variant="outlined"
                  type="number"
                  defaultValue={setting.dc}
                  onChange={(ev) => {
                     const min = setting.range.min;
                     const max = setting.range.max;
                     let value = ev.target.value;

                     if (value < min) {
                        ev.target.value = min;
                     } else if (value > max) {
                        ev.target.value = max;
                     } else {
                        ev.target.value =
                           value - ((value - min) % setting.range.increment);
                     }

                     data.current.settings[setting.index].dc = ev.target.value;
                  }}
               />
            </>
         );
      } else {
         return (
            <>
               <TextField
                  fullWidth
                  size="small"
                  label="AC"
                  variant="outlined"
                  type="number"
                  defaultValue={setting.ac}
                  onChange={(ev) =>
                     (data.current.settings[setting.index].ac = ev.target.value)
                  }
                  style={{ marginBottom: "15px" }}
               />
               <TextField
                  fullWidth
                  size="small"
                  label="DC"
                  variant="outlined"
                  type="number"
                  defaultValue={setting.dc}
                  onChange={(ev) =>
                     (data.current.settings[setting.index].dc = ev.target.value)
                  }
               />
            </>
         );
      }
   }

   async function handleFileChange(ev) {
      data.current = parsePlan(await ev.target.files[0].text());
      setReady((prevReady) => prevReady + 1);
      filePicker.current.value = "";
   }

   return (
      <Container className="container">
         <IconButton
            color="primary"
            component="label"
            style={{ position: "fixed", top: "100px", left: 0 }}
         >
            <input
               ref={filePicker}
               type="file"
               accept=".txt"
               hidden
               onChange={handleFileChange}
            />
            <FileUploadIcon fontSize="large" />
         </IconButton>
         {ready ? (
            <>
               <IconButton
                  color="primary"
                  component="label"
                  style={{ position: "fixed", top: "150px", left: 0 }}
                  onClick={() => saveFile(data.current)}
               >
                  <FileDownloadIcon fontSize="large" />
               </IconButton>
               <TableContainer component={Paper}>
                  <Table>
                     <TableHead>
                        <TableRow>
                           <TableCell align="center" colSpan={5}>
                              <Tooltip
                                 title={
                                    <h2>{data.current.powerScheme.guid}</h2>
                                 }
                              >
                                 <div>{data.current.powerScheme.name}</div>
                              </Tooltip>
                           </TableCell>
                        </TableRow>
                        <TableRow>
                           <TableCell>Subgroup</TableCell>
                           <TableCell>Setting</TableCell>
                           <TableCell>Value</TableCell>
                           <TableCell>Possible Values</TableCell>
                           <TableCell>Copy Command</TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {data.current.settings.map((setting) => (
                           <TableRow
                              key={setting.index}
                              sx={{
                                 "&:last-child td, &:last-child th": {
                                    border: 0
                                 }
                              }}
                           >
                              <TableCell>
                                 <Tooltip
                                    title={
                                       <>
                                          <h2>{setting.subgroup.guid}</h2>
                                          <h2>{setting.subgroup.alias}</h2>
                                       </>
                                    }
                                 >
                                    <div>{setting.subgroup.name}</div>
                                 </Tooltip>
                              </TableCell>
                              <TableCell>
                                 <Tooltip
                                    title={
                                       <>
                                          <h2>{setting.guid}</h2>
                                          <h2>{setting.alias}</h2>
                                       </>
                                    }
                                 >
                                    <div>{setting.name}</div>
                                 </Tooltip>
                              </TableCell>
                              <TableCell>
                                 <Values setting={setting} />
                              </TableCell>
                              <TableCell>
                                 <PossibleValues setting={setting} />
                              </TableCell>
                              <TableCell>
                                 <IconButton
                                    onClick={() =>
                                       navigator.clipboard.writeText(
                                          `powercfg /setacvalueindex ${data.current.powerScheme.guid} ${setting.subgroup.guid} ${setting.guid} ${setting.ac}` +
                                             "\n" +
                                             `powercfg /setdcvalueindex ${data.current.powerScheme.guid} ${setting.subgroup.guid} ${setting.guid} ${setting.dc}`
                                       )
                                    }
                                 >
                                    <ContentCopyIcon fontSize="small" />
                                 </IconButton>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </>
         ) : (
            <>
               <h2>Open CMD as Admin</h2>
               <h2
                  onClick={() =>
                     navigator.clipboard.writeText(
                        "powercfg /QH > C:\\powersettings.txt"
                     )
                  }
               >
                  <IconButton style={{ marginRight: "5px" }}>
                     <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  powercfg /QH {">"} C:\powersettings.txt
               </h2>
               <h2>Upload powersettings.txt</h2>
            </>
         )}
      </Container>
   );
}
