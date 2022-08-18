import { useState } from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { Link } from "react-router-dom";

export default function Nav(props) {
   const [state, setState] = useState(false);

   const toggleDrawer = (open) => (event) => {
      if (
         event.type === "keydown" &&
         (event.key === "Tab" || event.key === "Shift")
      ) {
         return;
      }

      setState(open);
   };

   return (
      <>
         <IconButton
            color="primary"
            onClick={toggleDrawer(true)}
            style={{ position: "fixed", top: 0, left: 0 }}
         >
            <MenuIcon fontSize="large" />
         </IconButton>
         <Drawer anchor="left" open={state} onClose={toggleDrawer(false)}>
            <Box
               sx={{ width: 220 }}
               role="presentation"
               onClick={toggleDrawer(false)}
               onKeyDown={toggleDrawer(false)}
            >
               <List>
                  {props.pages.map((page) => (
                     <Link
                        key={page[0]}
                        to={page[0]}
                        style={{ textDecoration: "none", color: "unset" }}
                     >
                        <ListItem disablePadding>
                           <ListItemButton>
                              <ListItemText primary={page[1]} />
                           </ListItemButton>
                        </ListItem>
                     </Link>
                  ))}
               </List>
            </Box>
         </Drawer>
      </>
   );
}
