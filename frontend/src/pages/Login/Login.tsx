import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useAuth } from "../../context/AuthContext";
import { loginSchema } from "../../validation/schemas";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [shouldShowPassword, setShouldShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const parsed = loginSchema.safeParse({ username, password });
  const isSubmitButtonEnabled = parsed.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    setFormError("");

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setUsernameError(fieldErrors.username?.[0] ?? "");
      setPasswordError(fieldErrors.password?.[0] ?? "");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password.trim());
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }} elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {formError && (
          <Typography color="error" variant="body2">
            {formError}
          </Typography>
        )}
        <TextField
          label="Username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          error={!!usernameError}
          helperText={usernameError}
        />
        <TextField
          label="Password"
          type={shouldShowPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      shouldShowPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={() => setShouldShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseUp={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {shouldShowPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!isSubmitButtonEnabled || isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Paper>
  );
};
