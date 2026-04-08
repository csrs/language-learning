import Box from "@mui/material/Box";
import { WordsTable } from "../WordsTable/WordsTable";

export const Home = () => {
  return (
    <Box sx={{ py: 4 }}>
      <WordsTable />
    </Box>
  );
};
