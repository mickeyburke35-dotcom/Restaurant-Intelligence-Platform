export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

export type ParsedCsvRow = {
  cells: string[];
  rowNumber: number;
};

export type ParsedCsv = {
  headers: string[];
  rows: ParsedCsvRow[];
};

function isEmptyRow(cells: string[]): boolean {
  return cells.every((cell) => cell.trim().length === 0);
}

export function parseCsv(csvText: string): ParsedCsv {
  const parsedRows: ParsedCsvRow[] = [];
  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let rowNumber = 1;
  let fieldStarted = false;

  function pushField() {
    cells.push(field);
    field = "";
    fieldStarted = false;
  }

  function pushRow() {
    pushField();

    if (!isEmptyRow(cells)) {
      parsedRows.push({
        cells,
        rowNumber
      });
    }

    cells = [];
  }

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];

    if (inQuotes) {
      if (character === '"') {
        if (csvText[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }

      continue;
    }

    if (character === '"') {
      if (!fieldStarted || field.trim().length === 0) {
        field = "";
        fieldStarted = true;
        inQuotes = true;
      } else {
        field += character;
      }

      continue;
    }

    if (character === ",") {
      pushField();
      continue;
    }

    if (character === "\n") {
      pushRow();
      rowNumber += 1;
      continue;
    }

    if (character === "\r") {
      if (csvText[index + 1] === "\n") {
        continue;
      }

      pushRow();
      rowNumber += 1;
      continue;
    }

    field += character;
    fieldStarted = true;
  }

  if (inQuotes) {
    throw new CsvParseError("CSV contains an unclosed quoted field.");
  }

  if (fieldStarted || field.length > 0 || cells.length > 0) {
    pushRow();
  }

  if (parsedRows.length === 0) {
    throw new CsvParseError("CSV must include a header row.");
  }

  const [headerRow, ...dataRows] = parsedRows;
  const headers = [...headerRow.cells];

  if (headers.length > 0) {
    headers[0] = headers[0].replace(/^\uFEFF/, "");
  }

  return {
    headers,
    rows: dataRows
  };
}
