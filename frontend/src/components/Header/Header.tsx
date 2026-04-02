import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";

export const Header = () => {
  const { pathname } = useLocation();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

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

        {!isLoading && !user && (
          <>
            <Button
              component={RouterLink}
              to="/register"
              color="inherit"
              variant={isActive("/register") ? "outlined" : "text"}
              sx={{
                borderColor: isActive("/register")
                  ? "rgba(255,255,255,0.7)"
                  : undefined,
              }}
            >
              Register
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              variant={isActive("/login") ? "outlined" : "text"}
              sx={{
                borderColor: isActive("/login")
                  ? "rgba(255,255,255,0.7)"
                  : undefined,
              }}
            >
              Login
            </Button>
          </>
        )}

        {!isLoading && user && (
          <>
            <Button
              component={RouterLink}
              to="/edit-profile"
              color="inherit"
              variant={isActive("/edit-profile") ? "outlined" : "text"}
              sx={{
                borderColor: isActive("/edit-profile")
                  ? "rgba(255,255,255,0.7)"
                  : undefined,
              }}
            >
              Edit Profile
            </Button>

            <Typography sx={{ ml: "auto", mr: 1 }} color="inherit">
              {`Hello
              ${user.username}!`}
            </Typography>

            <Button
              color="inherit"
              variant="text"
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
