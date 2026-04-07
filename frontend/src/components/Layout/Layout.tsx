import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Header } from "../Header/Header";

export const Layout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Container
        component="main"
        disableGutters
        sx={{ flex: 1, py: 2, px: { xs: 0, sm: 3 } }}
        maxWidth="lg"
      >
        <Outlet />
      </Container>
    </Box>
  );
};
