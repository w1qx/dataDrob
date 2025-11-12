import { z } from "zod";

// File upload response schema
export const fileDataSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  rowCount: z.number(),
  columnCount: z.number(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.any())),
  totalRows: z.number(),
});

export type FileData = z.infer<typeof fileDataSchema>;

// File upload validation
export const MAX_FILE_SIZE_CSV = 1024 * 1024 * 1024; // 1GB for CSV (streamed)
export const MAX_FILE_SIZE_EXCEL = 100 * 1024 * 1024; // 100MB for Excel (memory-loaded)
export const MAX_FILE_SIZE = MAX_FILE_SIZE_CSV; // For frontend general validation

export const SUPPORTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
];
