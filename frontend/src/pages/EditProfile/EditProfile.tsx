import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { editProfile } from "../../api/editProfile";

export const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEditProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await editProfile(username.trim(), email.trim());
      setUsername("");
      setEmail("");
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
          onSubmit={handleSubmitEditProfile}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={
              username.trim().length > 0 ||
              email.trim().length > 0 ||
              isSubmitting
            }
          >
            {isSubmitting ? "Updating..." : "Edit profile"}
          </Button>
        </Box>
      </Paper>

      <ChangePassword />
    </Box>
  );
};
