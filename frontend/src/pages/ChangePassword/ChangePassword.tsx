import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { changePassword } from "../../api/changePassword";
import { changePasswordSchema } from "../../validation/schemas";

export const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isSubmitButtonEnabled = changePasswordSchema.safeParse({
    password,
  }).success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await changePassword(password);
      navigate("/");
    } catch (err) {
      console.error(`Error creating new user: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Paper sx={{ p: 3 }} elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        Change password
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
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
          {isSubmitting ? "Changing..." : "Change password"}
        </Button>
      </Box>
    </Paper>
  );
};
