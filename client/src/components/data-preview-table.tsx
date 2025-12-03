import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileData } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataPreviewTableProps {
  fileData: FileData;
}

export function DataPreviewTable({ fileData }: DataPreviewTableProps) {
  // Show all rows
  const displayRows = fileData.rows;

  return (
    <div className="space-y-4 font-['Cairo']">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          معاينة البيانات
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="text-preview-info">
          عرض {fileData.totalRows.toLocaleString()} صفوف
        </p>
      </div>

      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden border-0 shadow-lg rounded-2xl">
        <ScrollArea className="w-full h-[600px] rounded-2xl" dir="rtl">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#6AC1E8] shadow-sm border-b border-[#5AB1D8]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[50px] text-white font-bold text-center first:rounded-tr-xl">#</TableHead>
                  {fileData.headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className={`
                        text-white font-bold text-right whitespace-nowrap px-4 py-3 md:px-6 md:py-4
                        ${index === fileData.headers.length - 1 ? 'last:rounded-tl-xl' : ''}
                      `}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 last:border-0 odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-900 dark:even:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-center text-muted-foreground bg-gray-50/50 dark:bg-slate-800/50">
                      {rowIndex + 1}
                    </TableCell>
                    {row.map((cell: any, cellIndex: number) => (
                      <TableCell
                        key={cellIndex}
                        className="text-right whitespace-nowrap px-4 py-3 md:px-6 md:py-3 text-gray-700 dark:text-gray-300"
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
