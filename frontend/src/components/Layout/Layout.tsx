import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Header } from "../Header/Header";

export const Layout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        disableGutters
        maxWidth="lg"
        sx={{
          mt: { xs: 0, sm: 1 },
          px: { xs: 2.25, sm: 3.5 },
          py: { xs: 2.5, sm: 3.75 },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};
