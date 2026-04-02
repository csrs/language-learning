import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { editProfile } from "../../api/editProfile";
import { editProfileSchema } from "../../validation/schemas";

export const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isSubmitButtonEnabled = editProfileSchema.safeParse({
    username,
    email,
  }).success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await editProfile(username.trim(), email.trim());
      navigate("/");
    } catch (err) {
      console.error(`Error creating new user: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Edit profile
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!isSubmitButtonEnabled || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Edit profile"}
          </Button>
        </Box>
      </Paper>

      <ChangePassword />
    </Box>
  );
};
