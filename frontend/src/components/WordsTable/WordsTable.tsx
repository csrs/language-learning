import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import type { TableComponents } from "react-virtuoso";
import { TableVirtuoso } from "react-virtuoso";
import { useEffect } from "react";
import type { WordSuccessResponse } from "../../api/getWords";
import { Box, Checkbox, CircularProgress, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { getAllWords } from "../../api/getWords";

interface Data {
  id: number;
  frequencyRank: number | null;
  value: string;
  partOfSpeech: string;
  translation: string;
  exampleBaseSentence: string;
  exampleTargetSentence: string;
}

type Order = "asc" | "desc";

interface ColumnData {
  dataKey: keyof Data;
  label: string;
  numeric?: boolean;
  width?: number;
}

interface FixedHeaderContentProps {
  order: Order;
  orderBy: keyof Data;
  onRequestSort: (property: keyof Data) => void;
  numSelected: number;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const columns: ColumnData[] = [
  {
    width: 100,
    label: "Frequency Rank",
    dataKey: "frequencyRank",
    numeric: true,
  },
  {
    width: 100,
    label: "Value",
    dataKey: "value",
  },
  {
    width: 100,
    label: "Part of Speech",
    dataKey: "partOfSpeech",
  },
  {
    width: 110,
    label: "Translation",
    dataKey: "translation",
  },
  {
    width: 130,
    label: "Example Target Sentence",
    dataKey: "exampleTargetSentence",
  },
  {
    width: 130,
    label: "Example Base Sentence",
    dataKey: "exampleBaseSentence",
  },
];

export const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (typeof aValue === "number" && typeof bValue === "number") {
    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  }

  return String(bValue).localeCompare(String(aValue), undefined, {
    sensitivity: "base",
  });
};

export const getComparator = <Key extends keyof Data>(
  order: Order,
  orderBy: Key,
) => {
  return (a: Data, b: Data) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue == null && bValue == null) {
      return 0;
    }
    if (aValue == null) {
      return 1;
    }
    if (bValue == null) {
      return -1;
    }

    return order === "desc"
      ? descendingComparator(a, b, orderBy)
      : -1 * descendingComparator(a, b, orderBy);
  };
};

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export const FixedHeaderContent = ({
  order,
  orderBy,
  onRequestSort,
  numSelected,
  rowCount,
  onSelectAllClick,
}: FixedHeaderContentProps) => {
  const createSortHandler = (property: keyof Data) => () => {
    onRequestSort(property);
  };

  return (
    <TableRow>
      <TableCell
        padding="checkbox"
        sx={{ backgroundColor: "background.paper" }}
      >
        <Checkbox
          color="primary"
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={rowCount > 0 && numSelected === rowCount}
          onChange={onSelectAllClick}
          slotProps={{
            input: { "aria-label": "select all words" },
          }}
        />
      </TableCell>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          sortDirection={orderBy === column.dataKey ? order : false}
          style={{ width: column.width }}
          sx={{ backgroundColor: "background.paper" }}
        >
          <TableSortLabel
            active={orderBy === column.dataKey}
            direction={orderBy === column.dataKey ? order : "asc"}
            onClick={createSortHandler(column.dataKey)}
          >
            {column.label}
            {orderBy === column.dataKey ? (
              <Box component="span" sx={visuallyHidden}>
                {order === "desc" ? "sorted descending" : "sorted ascending"}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
      ))}
    </TableRow>
  );
};

interface RowContentProps {
  row: Data;
  isSelected: boolean;
  onToggleRow: (row: Data) => void;
}

export const RowContent = ({
  row,
  isSelected,
  onToggleRow,
}: RowContentProps) => {
  return (
    <>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isSelected}
          onChange={() => onToggleRow(row)}
          slotProps={{
            input: { "aria-label": `select ${row.value}` },
          }}
        />
      </TableCell>
      {columns.map((column) => (
        <TableCell key={column.dataKey}>{row[column.dataKey]}</TableCell>
      ))}
    </>
  );
};

export const WordsTable = () => {
  const [isFetching, setIsFetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("frequencyRank");
  const [selectedData, setSelectedData] = React.useState<Data[]>([]);

  const handleRequestSort = (property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const selectedIds = React.useMemo(
    () => new Set(selectedData.map((row) => row.id)),
    [selectedData],
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedData(rows);
      return;
    }

    setSelectedData([]);
  };

  const handleToggleRow = (row: Data) => {
    setSelectedData((currentSelectedData) => {
      const isSelected = currentSelectedData.some(
        (selectedRow) => selectedRow.id === row.id,
      );

      if (isSelected) {
        return currentSelectedData.filter(
          (selectedRow) => selectedRow.id !== row.id,
        );
      }

      return [...currentSelectedData, row];
    });
  };

  const sortedRows = React.useMemo(
    () => [...rows].sort(getComparator(order, orderBy)),
    [order, orderBy, rows],
  );

  const getData = async () => {
    try {
      setIsFetching(true);
      const apiResult = await getAllWords();
      const nextRows = apiResult.map((word: WordSuccessResponse): Data => {
        return {
          id: word.id,
          frequencyRank: word.frequencyRank,
          value: word.value,
          partOfSpeech: word.partOfSpeech ?? "",
          translation: word.translation ?? "",
          exampleBaseSentence: word.exampleBase ?? "",
          exampleTargetSentence: word.exampleTarget ?? "",
        };
      });

      setRows(nextRows);
      setSelectedData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch words");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return isFetching ? (
    <CircularProgress aria-label="Loading…" />
  ) : error ? (
    <Typography color="error">Error: {error}</Typography>
  ) : (
    <Paper style={{ height: 400, width: "100%" }}>
      <TableVirtuoso
        data={sortedRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => (
          <FixedHeaderContent
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            numSelected={selectedData.length}
            rowCount={rows.length}
            onSelectAllClick={handleSelectAllClick}
          />
        )}
        itemContent={(_index, row) => (
          <RowContent
            row={row}
            isSelected={selectedIds.has(row.id)}
            onToggleRow={handleToggleRow}
          />
        )}
      />
    </Paper>
  );
};
