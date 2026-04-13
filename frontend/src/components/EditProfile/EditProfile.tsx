import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { editProfile } from "../../api/editProfile";
import { editProfileSchema } from "../../validation/schemas";
import { useAuth } from "../../context/AuthContext";
import {
  SharedFormPaper,
  sharedFormErrorSx,
  sharedFormFieldSx,
  sharedSubmitButtonSx,
} from "../SharedFormPaper/SharedFormPaper";

export const EditProfile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined,
  );
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
    <Stack spacing={3} sx={{ maxWidth: 520, mx: "auto", mt: { xs: 0, sm: 4 } }}>
      <SharedFormPaper maxWidth={520} sx={{ mt: 0 }}>
        <Stack spacing={1} sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{ color: "success.dark", fontWeight: 700, letterSpacing: 1.1 }}
          >
            Profile
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: -0.5 }}
          >
            Edit your details
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.6,
              maxWidth: 360,
              mx: "auto",
            }}
          >
            Update the account details you use to sign in and manage your
            progress.
          </Typography>
        </Stack>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
        >
          {formError && (
            <Box sx={sharedFormErrorSx}>
              <Typography color="error" variant="body2">
                {formError}
              </Typography>
            </Box>
          )}
          <TextField
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            error={!!usernameError}
            helperText={
              usernameError ||
              "Clear this field if you want to keep your current username."
            }
            sx={sharedFormFieldSx}
          />
          <TextField
            label="Email address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            error={!!emailError}
            helperText={
              emailError ||
              "Clear this field if you want to keep your current email address."
            }
            sx={sharedFormFieldSx}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isSubmitButtonEnabled || isSubmitting}
            sx={sharedSubmitButtonSx}
          >
            {isSubmitting ? "Updating..." : "Save changes"}
          </Button>
        </Box>
      </SharedFormPaper>

      <ChangePassword sx={{ mt: 0 }} />
    </Stack>
  );
};
