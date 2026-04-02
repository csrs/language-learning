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
  const { register } = useAuth();
  const navigate = useNavigate();

  const isSubmitButtonEnabled = registerSchema.safeParse({
    username,
    email,
    password,
  }).success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      console.error(`Error registering: ${err}`);
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
        <TextField
          label="Username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
        />
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
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </Box>
    </Paper>
  );
};
