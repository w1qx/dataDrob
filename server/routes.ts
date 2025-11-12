import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { MAX_FILE_SIZE_CSV, MAX_FILE_SIZE_EXCEL, fileDataSchema } from "@shared/schema";
import { unlink } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { tmpdir } from "os";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for disk-based file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: tmpdir(),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: MAX_FILE_SIZE_CSV, // Set max to CSV limit initially
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
      }
    },
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    let filePath: string | undefined;
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded" 
        });
      }

      const file = req.file;
      filePath = file.path;
      
      // Check Excel file size limit (100MB)
      const isExcel = file.mimetype.includes('spreadsheet') || file.mimetype.includes('ms-excel');
      if (isExcel && file.size > MAX_FILE_SIZE_EXCEL) {
        return res.status(413).json({ 
          error: `Excel files are limited to 100MB due to memory constraints. For larger datasets, please convert to CSV format (up to 1GB supported).` 
        });
      }
      
      let headers: string[] = [];
      let rows: any[][] = [];
      let totalRows = 0;

      // Parse based on file type
      if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        // Parse CSV from disk - only keep first 20 rows, count the rest
        await new Promise<void>((resolve, reject) => {
          let headersParsed = false;
          let rowCount = 0;
          const previewRows: any[][] = [];
          const PREVIEW_LIMIT = 20;
          
          Papa.parse(createReadStream(filePath!), {
            header: false,
            skipEmptyLines: true,
            chunk: (results) => {
              const data = results.data as any[][];
              
              for (const row of data) {
                if (!headersParsed) {
                  // First row is headers
                  headers = row.map((h: any, i: number) => 
                    h ? String(h) : `Column ${i + 1}`
                  );
                  headersParsed = true;
                } else {
                  // Data rows
                  rowCount++;
                  if (previewRows.length < PREVIEW_LIMIT) {
                    previewRows.push(row);
                  }
                }
              }
            },
            complete: () => {
              rows = previewRows;
              totalRows = rowCount;
              resolve();
            },
            error: (error) => {
              reject(error);
            }
          });
        });
      } else {
        // Parse Excel from disk - only read first 21 rows (header + 20 data rows)
        const PREVIEW_LIMIT = 21; // 1 header + 20 data rows
        
        // Read only preview rows - use !fullref to get total count
        const workbook = XLSX.readFile(filePath, { 
          sheetRows: PREVIEW_LIMIT,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get total row count from !fullref (contains full range even with sheetRows limit)
        const fullRef = worksheet['!fullref'] || worksheet['!ref'] || 'A1';
        const range = XLSX.utils.decode_range(fullRef);
        totalRows = Math.max(0, range.e.r); // Total rows (0-indexed, includes header)
        
        // Parse the preview data
        const previewData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null,
          raw: false,
        }) as any[][];
        
        if (previewData.length > 0) {
          headers = previewData[0].map((h: any, i: number) => 
            h ? String(h) : `Column ${i + 1}`
          );
          rows = previewData.slice(1);
          // totalRows is 0-indexed, so actual row count is totalRows
          // But we need to subtract 1 for the header row to get data row count
          totalRows = totalRows > 0 ? totalRows : rows.length;
        }
      }

      // Prepare response data
      const fileData = {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        rowCount: Math.min(rows.length, 20),
        columnCount: headers.length,
        headers,
        rows: rows.slice(0, 20), // Only send first 20 rows for preview
        totalRows,
      };

      // Validate response
      const validatedData = fileDataSchema.parse(fileData);

      res.json(validatedData);
    } catch (error) {
      console.error("File upload error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('File too large')) {
          return res.status(413).json({ 
            error: "File size exceeds 1GB limit" 
          });
        }
        return res.status(400).json({ 
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to process file" 
      });
    } finally {
      // Clean up temp file
      if (filePath) {
        try {
          await unlink(filePath);
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
