import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

export const Header = () => {
  const { pathname } = useLocation();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) {
      timer = setTimeout(() => setShouldShowSkeleton(true), 6);
    } else {
      setShouldShowSkeleton(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

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

        {!user && (
          <>
            {isLoading && shouldShowSkeleton ? (
              <>
                <Skeleton
                  variant="rounded"
                  width={100}
                  height={38}
                  sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
                />
                <Skeleton
                  variant="rounded"
                  width={100}
                  height={38}
                  sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
                />
              </>
            ) : (
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
          </>
        )}

        {user && (
          <>
            {isLoading && shouldShowSkeleton ? (
              <>
                <Skeleton variant="rounded" width={210} height={60} />
                <Skeleton variant="rounded" width={210} height={60} />
              </>
            ) : (
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
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
