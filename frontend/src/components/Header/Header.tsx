import { Link as RouterLink, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/register", label: "Register" },
  { to: "/login", label: "Login" },
  { to: "/edit-profile", label: "Edit Profile" },
] as const;

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color="inherit"
              variant={isActive ? "outlined" : "text"}
              sx={{
                borderColor: isActive ? "rgba(255,255,255,0.7)" : undefined,
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Toolbar>
    </AppBar>
  );
};
