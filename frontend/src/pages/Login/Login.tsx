import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useAuth } from "../../context/AuthContext";
import { loginSchema } from "../../validation/schemas";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isSubmitButtonEnabled = loginSchema.safeParse({
    email,
    password,
  }).success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email.trim(), password.trim());
      navigate("/");
    } catch (err) {
      console.error(`Error logging in: ${err}`);
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
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
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
