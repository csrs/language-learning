import Box from "@mui/material/Box";
import { GetDetailsByWordForm } from "../../components/GetDetailsByWordForm/GetDetailsByWordForm";

export const Home = () => {
  return (
    <Box sx={{ py: 4 }}>
      <GetDetailsByWordForm />
    </Box>
  );
};
