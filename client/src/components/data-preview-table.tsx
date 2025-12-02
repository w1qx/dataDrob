import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileData } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataPreviewTableProps {
  fileData: FileData;
}

export function DataPreviewTable({ fileData }: DataPreviewTableProps) {
  const displayRows = fileData.rows.slice(0, 20);
  const hasMoreRows = fileData.totalRows > displayRows.length;

  return (
    <div className="space-y-4 font-['Cairo']">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          معاينة البيانات
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="text-preview-info">
          عرض {displayRows.length} من {fileData.totalRows.toLocaleString()} صفوف
        </p>
      </div>

      <Card className="bg-card/90 backdrop-blur-sm overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {fileData.headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className="font-semibold text-foreground px-4 py-3 whitespace-nowrap sticky top-0 bg-muted/50 text-right"
                      data-testid={`header-${index}`}
                    >
                      {header || `عمود ${index + 1}`}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="hover-elevate"
                    data-testid={`row-${rowIndex}`}
                  >
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="px-4 py-2 text-sm text-right"
                        data-testid={`cell-${rowIndex}-${cellIndex}`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {hasMoreRows && (
          <div className="border-t bg-muted/30 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              {fileData.totalRows - displayRows.length} صفوف إضافية غير معروضة
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
