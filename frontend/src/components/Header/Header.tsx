import { Link as RouterLink, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

export const Header = () => {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        <Button
          component={RouterLink}
          to="/"
          color="inherit"
          variant={isActive("/") ? "outlined" : "text"}
          sx={{
            borderColor: isActive("/") ? "rgba(255,255,255,0.7)" : undefined,
          }}
        >
          Home
        </Button>
        <Button
          component={RouterLink}
          to="/about"
          color="inherit"
          variant={isActive("/about") ? "outlined" : "text"}
          sx={{
            borderColor: isActive("/about")
              ? "rgba(255,255,255,0.7)"
              : undefined,
          }}
        >
          About
        </Button>
      </Toolbar>
    </AppBar>
  );
};
