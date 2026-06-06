import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
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

  const getNavButtonSx = (isCurrentPage: boolean) => ({
    px: 1.75,
    py: 0.85,
    minWidth: 0,
    borderRadius: 999,
    border: "1px solid",
    borderColor: isCurrentPage
      ? "rgba(46, 125, 50, 0.2)"
      : "rgba(15, 23, 42, 0.14)",
    color: isCurrentPage ? "success.dark" : "text.primary",
    backgroundColor: isCurrentPage
      ? "rgba(46, 125, 50, 0.12)"
      : "rgba(255, 255, 255, 0.7)",
    fontWeight: 600,
    textTransform: "none",
    boxShadow: isCurrentPage ? "0 10px 24px rgba(46, 125, 50, 0.08)" : "none",
    "&:hover": {
      borderColor: isCurrentPage
        ? "rgba(46, 125, 50, 0.28)"
        : "rgba(15, 23, 42, 0.23)",
      backgroundColor: isCurrentPage
        ? "rgba(46, 125, 50, 0.16)"
        : "rgba(248, 250, 252, 0.96)",
    },
  });

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
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        backgroundImage:
          "linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.9) 100%)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.04)",
        color: "text.primary",
      }}
    >
      <Toolbar
        sx={{
          gap: 1.25,
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.25, sm: 1.5 },
          minHeight: { xs: "auto", sm: 72 },
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            flex: "1 1 auto",
            justifyContent: { xs: "center", sm: "flex-start" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            component={RouterLink}
            to="/"
            variant="text"
            sx={getNavButtonSx(isActive("/"))}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            variant="text"
            sx={getNavButtonSx(isActive("/about"))}
          >
            About
          </Button>
        </Box>

        {!user && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-end" },
              width: { xs: "100%", sm: "auto" },
              ml: { sm: "auto" },
            }}
          >
            {isLoading && shouldShowSkeleton ? (
              <>
                <Skeleton
                  variant="rounded"
                  width={100}
                  height={40}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: 999 }}
                />
                <Skeleton
                  variant="rounded"
                  width={96}
                  height={40}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: 999 }}
                />
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="text"
                  sx={getNavButtonSx(isActive("/register"))}
                >
                  Register
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  sx={getNavButtonSx(isActive("/login"))}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        )}

        {user && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-end" },
              width: { xs: "100%", sm: "auto" },
              ml: { sm: "auto" },
            }}
          >
            {isLoading && shouldShowSkeleton ? (
              <>
                <Skeleton
                  variant="rounded"
                  width={126}
                  height={40}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: 999 }}
                />
                <Skeleton
                  variant="rounded"
                  width={150}
                  height={24}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: 999 }}
                />
                <Skeleton
                  variant="rounded"
                  width={96}
                  height={40}
                  sx={{ bgcolor: "rgba(15, 23, 42, 0.08)", borderRadius: 999 }}
                />
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    px: 0.5,
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {`Hello, ${user.username}!`}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/edit-profile"
                  variant="text"
                  sx={getNavButtonSx(isActive("/edit-profile"))}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="text"
                  sx={getNavButtonSx(false)}
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
