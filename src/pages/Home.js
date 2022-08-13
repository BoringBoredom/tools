import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";

export default function Home(props) {
   return (
      <Container
         className="container"
         maxWidth="xs"
      >
         <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <nav>
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
            </nav>
         </Box>
      </Container>
   )
}