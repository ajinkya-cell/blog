import {
  PortableText,
  type PortableTextBlock,
  type PortableTextReactComponents,
} from "next-sanity";

export interface TableCellValue {
  _key: string;
  value?: PortableTextBlock[] | null;
}

export interface TableRowValue {
  _key: string;
  cells?: TableCellValue[] | null;
}

export interface TableBlockValue {
  headerRows?: number | null;
  rows?: TableRowValue[] | null;
}

function TableCell({
  cell,
  isHeader,
  cellComponents,
}: Readonly<{
  cell: TableCellValue;
  isHeader: boolean;
  cellComponents: Partial<PortableTextReactComponents>;
}>) {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      className={
        isHeader
          ? "border-border/40 border-b px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider"
          : "border-border/20 border-b px-4 py-3 text-left text-foreground/80 align-top last:border-b-0"
      }
      scope={isHeader ? "col" : undefined}
    >
      {Array.isArray(cell.value) ? (
        <PortableText components={cellComponents} value={cell.value} />
      ) : null}
    </CellTag>
  );
}

function TableRow({
  row,
  isHeader,
  cellComponents,
}: Readonly<{
  row: TableRowValue;
  isHeader: boolean;
  cellComponents: Partial<PortableTextReactComponents>;
}>) {
  return (
    <tr className="transition-colors hover:bg-foreground/[0.02]">
      {(row.cells ?? []).map((cell) => (
        <TableCell
          cell={cell}
          cellComponents={cellComponents}
          isHeader={isHeader}
          key={cell._key}
        />
      ))}
    </tr>
  );
}

export function TableBlock({
  headerRows,
  rows,
  cellComponents,
}: Readonly<
  TableBlockValue & {
    cellComponents: Partial<PortableTextReactComponents>;
  }
>) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const headerRowCount = Math.max(0, headerRows ?? 0);
  const headRows = rows.slice(0, headerRowCount);
  const bodyRows = rows.slice(headerRowCount);

  return (
    <div className="site-chassis not-prose relative my-8 overflow-x-auto rounded-2xl">
      <table className="w-full border-collapse text-sm">
        {headRows.length > 0 ? (
          <thead className="bg-foreground/[0.03]">
            {headRows.map((row) => (
              <TableRow
                cellComponents={cellComponents}
                isHeader
                row={row}
                key={row._key}
              />
            ))}
          </thead>
        ) : null}
        <tbody>
          {bodyRows.map((row) => (
            <TableRow
              cellComponents={cellComponents}
              isHeader={false}
              row={row}
              key={row._key}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
