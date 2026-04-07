import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";
import { registerSchema } from "../../validation/schemas";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import z from "zod";
import { SharedFormPaper } from "../../components/SharedFormPaper/SharedFormPaper";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [shouldShowPassword, setShouldShowPassword] = useState(true);

  const { register } = useAuth();
  const navigate = useNavigate();

  const parsedInput = registerSchema.safeParse({ username, email, password });
  const isSubmitButtonEnabled = parsedInput.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!parsedInput.success) {
      const flattenedError = z.flattenError(parsedInput.error);
      setUsernameError(flattenedError.fieldErrors.username?.[0]);
      setEmailError(flattenedError.fieldErrors.email?.[0]);
      setPasswordError(flattenedError.fieldErrors.password?.[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/login");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <SharedFormPaper>
      <Typography variant="h5" align="center" gutterBottom>
        Register
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
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
          helperText={
            usernameError || "Username must be between 2 and 20 characters"
          }
        />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          error={!!emailError}
          helperText={emailError || "Email must be a valid email address"}
        />
        <TextField
          label="Password"
          type={shouldShowPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError || "Password must be at least 8 characters"}
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
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </Box>
    </SharedFormPaper>
  );
};
