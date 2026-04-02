import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useAuth } from "../../context/AuthContext";
import { registerSchema } from "../../validation/schemas";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const parsed = registerSchema.safeParse({ username, email, password });
  const isSubmitButtonEnabled = parsed.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setFormError("");

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setUsernameError(fieldErrors.username?.[0] ?? "");
      setEmailError(fieldErrors.email?.[0] ?? "");
      setPasswordError(fieldErrors.password?.[0] ?? "");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Paper sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3 }} elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Register
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
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          error={!!passwordError}
          helperText={passwordError || "Password must be at least 8 characters"}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!isSubmitButtonEnabled || isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </Box>
    </Paper>
  );
};
