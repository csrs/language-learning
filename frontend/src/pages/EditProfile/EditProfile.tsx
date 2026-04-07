import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { editProfile } from "../../api/editProfile";
import { editProfileSchema } from "../../validation/schemas";
import { useAuth } from "../../context/AuthContext";

export const EditProfile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const parsed = editProfileSchema.safeParse({ username, email });
  const isSubmitButtonEnabled = parsed.success;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError(undefined);
    setEmailError(undefined);
    setFormError(undefined);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setUsernameError(flat.fieldErrors.username?.[0]);
      setEmailError(flat.fieldErrors.email?.[0]);
      setFormError(flat.formErrors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await editProfile(username.trim(), email.trim());
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Edit profile failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // This is inside a useEffect because user comes from the 'GET me' endpoint called in AuthContext, and that endpoint is async.
    // We need to wait to get a result from the endpoint, but the username and email states in this component won't update after
    // the user is initialized. So we ned to have them update inside a useEffect.
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

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
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          )}
          <TextField
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            error={!!usernameError}
            hiddenLabel
            helperText={
              usernameError ||
              "Username must be between 2 and 20 characters. If nothing is entered here, your current username will remain."
            }
            aria-label="Username"
          />
          <TextField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            error={!!emailError}
            helperText={
              emailError ||
              "Email must be a valid email address. If nothing is entered here, your current email address will remain."
            }
            aria-label="Email address"
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
