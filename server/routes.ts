import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import XLSX from "xlsx";
import Papa from "papaparse";
import {
  MAX_FILE_SIZE_CSV,
  MAX_FILE_SIZE_EXCEL,
  fileDataSchema,
  filterRequestSchema,
  sendRequestSchema,
} from "@shared/schema";
import { unlink, copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";
import { tmpdir } from "os";
import { parse, isValid, isWithinInterval, format } from "date-fns";

// Final output path (local folder)
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const TEMP_DIR = path.join(UPLOADS_DIR, "temp");
const FINAL_DIR = path.join(UPLOADS_DIR, "final");
const FINAL_FILE_PATH = path.join(FINAL_DIR, "customers.xls");
const CURRENT_METADATA_PATH = path.join(UPLOADS_DIR, "current_metadata.json");

import { randomUUID } from "crypto";

// Simple in-memory session store
const SESSIONS = new Set<string>();

// Middleware to check if user is authenticated via Token
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (token && SESSIONS.has(token)) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/login", (req, res) => {
    console.log("Login Request Body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    const { username, password } = req.body;

    // Hardcoded fallback for debugging
    const validUser = "raif";
    const validPass = "raif77";

    const inputUser = (username || "").trim().toLowerCase();
    const inputPass = (password || "").trim(); // Password case sensitive usually, but let's check

    console.log("Comparison:", {
      inputUser,
      validUser,
      matchUser: inputUser === validUser,
      matchPass: inputPass === "Raif77" // Check against the specific password user was given
    });

    // Allow "Raif" or "raif", and "Raif77"
    if (inputUser === validUser && inputPass === "Raif77") {
      const token = randomUUID();
      SESSIONS.add(token);
      res.json({ success: true, token });
    } else {
      res.status(401).json({
        error: "Invalid credentials",
        debug: {
          receivedUser: inputUser,
          receivedPass: inputPass,
          expectedUser: validUser,
          expectedPass: "Raif77",
          matchUser: inputUser === validUser,
          matchPass: inputPass === "Raif77"
        }
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    const token = req.headers.authorization;
    if (token) {
      SESSIONS.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/check-auth", (req, res) => {
    res.header("Cache-Control", "no-store");
    const token = req.headers.authorization;
    if (token && SESSIONS.has(token)) {
      res.json({ authenticated: true, user: { username: process.env.ADMIN_USERNAME } });
    } else {
      res.json({ authenticated: false });
    }
  });
  // Ensure directories exist
  await mkdir(TEMP_DIR, { recursive: true });
  await mkdir(FINAL_DIR, { recursive: true });

  // Configure multer for disk-based file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: TEMP_DIR, // Save directly to temp dir
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          uniqueSuffix + path.extname(file.originalname),
        );
      },
    }),
    limits: {
      fileSize: MAX_FILE_SIZE_CSV, // Set max to CSV limit initially
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only Excel and CSV files are allowed.",
          ),
        );
      }
    },
  });

  // Helper to extract unique values
  const extractUniqueValues = (rows: any[], headers: string[]) => {
    const neighborhoodIdx = headers.indexOf("عنوان العميل الكامل");
    const statusIdx = headers.indexOf("الحالة");

    const neighborhoods = new Set<string>();
    const statuses = new Set<string>();

    if (neighborhoodIdx !== -1 || statusIdx !== -1) {
      rows.forEach(row => {
        if (neighborhoodIdx !== -1 && row[neighborhoodIdx]) neighborhoods.add(String(row[neighborhoodIdx]).trim());
        if (statusIdx !== -1 && row[statusIdx]) statuses.add(String(row[statusIdx]).trim());
      });
    }

    return {
      uniqueNeighborhoods: Array.from(neighborhoods).sort(),
      uniqueStatuses: Array.from(statuses).sort()
    };
  };

  // Helper to format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (date: Date): string => {
    return format(date, 'dd/MM/yyyy');
  };

  // Helper to filter rows
  const filterRows = (rows: any[], headers: string[], filters: any) => {
    const neighborhoodIdx = headers.indexOf("عنوان العميل الكامل");
    const statusIdx = headers.indexOf("الحالة");
    const dateIdx = headers.indexOf("التاريخ");

    return rows.filter(row => {
      // Filter by Neighborhood
      if (filters.neighborhoods && filters.neighborhoods.length > 0 && neighborhoodIdx !== -1) {
        const val = String(row[neighborhoodIdx] || "").trim();
        if (!filters.neighborhoods.includes(val)) return false;
      }

      // Filter by Status
      if (filters.statuses && filters.statuses.length > 0 && statusIdx !== -1) {
        const val = String(row[statusIdx] || "").trim();
        if (!filters.statuses.includes(val)) return false;
      }

      // Filter by Date
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to) && dateIdx !== -1) {
        const cellValue = row[dateIdx];
        let parsedDate: Date | null = null;

        if (cellValue instanceof Date) {
          parsedDate = cellValue;
        } else if (typeof cellValue === 'string') {
          // Try parsing string formats if it came as string
          // Try DD/MM/YYYY
          const d = parse(cellValue.trim(), 'dd/MM/yyyy', new Date());
          if (isValid(d)) parsedDate = d;
          else {
            // Try MM/DD/YYYY or other formats if needed, or just new Date(str)
            const d2 = new Date(cellValue);
            if (isValid(d2)) parsedDate = d2;
          }
        }

        if (parsedDate && isValid(parsedDate)) {
          // Reset time part for comparison
          parsedDate.setHours(0, 0, 0, 0);

          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            fromDate.setHours(0, 0, 0, 0);
            if (parsedDate < fromDate) return false;
          }
          // If 'to' date is missing, default to 'from' date (Single day selection)
          const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date(filters.dateRange.from);
          toDate.setHours(0, 0, 0, 0);

          if (parsedDate > toDate) return false;
        }
      }

      return true;
    });
  };

  // Helper to process rows for output (format dates)
  const processRowsForOutput = (rows: any[], headers: string[]) => {
    const dateIdx = headers.indexOf("التاريخ");
    if (dateIdx === -1) return rows;

    return rows.map(row => {
      const newRow = [...row];
      if (newRow[dateIdx] instanceof Date) {
        newRow[dateIdx] = formatDateForDisplay(newRow[dateIdx]);
      }
      return newRow;
    });
  };

  // File upload endpoint
  app.post("/api/upload", requireAuth, upload.single("file"), async (req, res) => {
    let filePath: string | undefined;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      const file = req.file;
      filePath = file.path;

      // Check Excel file size limit (100MB)
      const isExcel =
        file.mimetype.includes("spreadsheet") ||
        file.mimetype.includes("ms-excel");
      if (isExcel && file.size > MAX_FILE_SIZE_EXCEL) {
        // Clean up immediately if too large
        await unlink(filePath).catch(() => { });
        return res.status(413).json({
          error:
            "Excel files are limited to 100MB due to memory constraints. For larger datasets, please convert to CSV format (up to 1GB supported).",
        });
      }

      let headers: string[] = [];
      let rows: any[][] = [];
      let totalRows = 0;
      let uniqueNeighborhoods: string[] = [];
      let uniqueStatuses: string[] = [];

      // Parse based on file type
      if (file.mimetype.includes("csv") || file.originalname.endsWith(".csv")) {
        // Parse CSV from disk
        await new Promise<void>((resolve, reject) => {
          let headersParsed = false;
          const allRows: any[][] = [];

          Papa.parse(createReadStream(filePath!), {
            header: false,
            skipEmptyLines: true,
            step: (results) => {
              const row = results.data as any[];
              if (!headersParsed) {
                headers = row.map((h: any, i: number) => h ? String(h) : `Column ${i + 1}`);
                headersParsed = true;
              } else {
                allRows.push(row);
              }
            },
            complete: () => {
              rows = allRows;
              totalRows = rows.length;
              const unique = extractUniqueValues(rows, headers);
              uniqueNeighborhoods = unique.uniqueNeighborhoods;
              uniqueStatuses = unique.uniqueStatuses;
              resolve();
            },
            error: (error) => {
              reject(error);
            },
          });
        });
      } else {
        // Parse Excel from disk
        // Use cellDates: true to get Date objects
        const workbook = XLSX.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: true, // Get raw values (Dates)
        }) as any[][];

        if (jsonData.length > 0) {
          headers = jsonData[0].map((h: any, i: number) =>
            h ? String(h) : `Column ${i + 1}`,
          );
          rows = jsonData.slice(1);
          totalRows = rows.length;

          const unique = extractUniqueValues(rows, headers);
          uniqueNeighborhoods = unique.uniqueNeighborhoods;
          uniqueStatuses = unique.uniqueStatuses;
        }
      }

      // Prepare response data
      // For preview, we want formatted dates
      const previewRows = processRowsForOutput(rows, headers);

      const fileData = {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        rowCount: rows.length,
        columnCount: headers.length,
        headers,
        rows: previewRows,
        totalRows,
        uniqueNeighborhoods,
        uniqueStatuses,
        tempFileName: file.filename, // Return the temp filename
      };

      // Validate response
      const validatedData = fileDataSchema.parse(fileData);

      // Save metadata for persistence
      const metadata = {
        fileName: file.originalname,
        tempFileName: file.filename,
        fileSize: file.size,
        fileType: file.mimetype,
      };
      await writeFile(CURRENT_METADATA_PATH, JSON.stringify(metadata));

      res.json(validatedData);
    } catch (error) {
      console.error("File upload error:", error);
      // Clean up temp file on error
      if (filePath) {
        await unlink(filePath).catch(() => { });
      }

      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to process file" });
    }
  });

  // Get current file endpoint (Persistence)
  app.get("/api/current-file", requireAuth, async (req, res) => {
    try {
      if (!existsSync(CURRENT_METADATA_PATH)) {
        return res.status(404).json({ error: "No active file" });
      }

      const metadata = JSON.parse(await readFile(CURRENT_METADATA_PATH, "utf-8"));
      const filePath = path.join(TEMP_DIR, metadata.tempFileName);

      if (!existsSync(filePath)) {
        // Metadata exists but file is gone (expired/deleted)
        await unlink(CURRENT_METADATA_PATH).catch(() => { });
        return res.status(404).json({ error: "File expired" });
      }

      // Re-process the file (Reuse logic - ideally refactored, but inline for now to ensure consistency)
      let headers: string[] = [];
      let rows: any[][] = [];
      let totalRows = 0;
      let uniqueNeighborhoods: string[] = [];
      let uniqueStatuses: string[] = [];

      if (metadata.fileType.includes("csv") || metadata.fileName.endsWith(".csv")) {
        await new Promise<void>((resolve, reject) => {
          let headersParsed = false;
          const allRows: any[][] = [];
          Papa.parse(createReadStream(filePath), {
            header: false,
            skipEmptyLines: true,
            step: (results) => {
              const row = results.data as any[];
              if (!headersParsed) {
                headers = row.map((h: any, i: number) => h ? String(h) : `Column ${i + 1}`);
                headersParsed = true;
              } else {
                allRows.push(row);
              }
            },
            complete: () => {
              rows = allRows;
              totalRows = rows.length;
              const unique = extractUniqueValues(rows, headers);
              uniqueNeighborhoods = unique.uniqueNeighborhoods;
              uniqueStatuses = unique.uniqueStatuses;
              resolve();
            },
            error: reject,
          });
        });
      } else {
        const workbook = XLSX.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: true }) as any[][];

        if (jsonData.length > 0) {
          headers = jsonData[0].map((h: any, i: number) => h ? String(h) : `Column ${i + 1}`);
          rows = jsonData.slice(1);
          totalRows = rows.length;
          const unique = extractUniqueValues(rows, headers);
          uniqueNeighborhoods = unique.uniqueNeighborhoods;
          uniqueStatuses = unique.uniqueStatuses;
        }
      }

      const previewRows = processRowsForOutput(rows, headers);
      const fileData = {
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        fileType: metadata.fileType,
        rowCount: rows.length,
        columnCount: headers.length,
        headers,
        rows: previewRows,
        totalRows,
        uniqueNeighborhoods,
        uniqueStatuses,
        tempFileName: metadata.tempFileName,
      };

      res.json(fileData);
    } catch (error) {
      console.error("Get current file error:", error);
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  });

  // Delete current file endpoint
  app.delete("/api/current-file", requireAuth, async (req, res) => {
    try {
      if (existsSync(CURRENT_METADATA_PATH)) {
        const metadata = JSON.parse(await readFile(CURRENT_METADATA_PATH, "utf-8"));
        const filePath = path.join(TEMP_DIR, metadata.tempFileName);

        // Delete metadata
        await unlink(CURRENT_METADATA_PATH).catch(() => { });

        // Optionally delete the temp file too, or leave it for cleanup job
        // Let's delete it to be clean
        if (existsSync(filePath)) {
          await unlink(filePath).catch(() => { });
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete current file error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Filter endpoint (Preview)
  app.post("/api/filter", requireAuth, async (req, res) => {
    try {
      const { neighborhoods, statuses, dateRange, filePath } = filterRequestSchema.parse(req.body);

      // Use the temp file if provided (filePath here is actually the tempFileName from frontend)
      // Or fallback to final file if we wanted to support filtering existing files, but for now let's assume temp flow.
      // The frontend sends "customers.xls" currently, we need to update that to send the tempFileName.

      // Check if it's a temp file
      let targetPath = path.join(TEMP_DIR, filePath);
      if (!existsSync(targetPath)) {
        // Fallback to final path if not found in temp (legacy support or if we want to filter the last sent file)
        targetPath = FINAL_FILE_PATH;
      }

      if (!existsSync(targetPath)) {
        return res.status(404).json({ error: "File not found" });
      }

      let rows: any[][] = [];
      let headers: string[] = [];

      // Read with cellDates: true
      const workbook = XLSX.readFile(targetPath, { cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: true,
      }) as any[][];

      if (jsonData.length > 0) {
        headers = jsonData[0].map((h: any, i: number) => h ? String(h) : `Column ${i + 1}`);
        rows = jsonData.slice(1);
      }

      const filteredRows = filterRows(rows, headers, { neighborhoods, statuses, dateRange });
      const previewRows = processRowsForOutput(filteredRows, headers);

      res.json({
        rows: previewRows,
        totalRows: filteredRows.length
      });

    } catch (error) {
      console.error("Filter error:", error);
      res.status(500).json({ error: "Failed to filter data" });
    }
  });

  // Send endpoint (Final Save)
  app.post("/api/send", requireAuth, async (req, res) => {
    try {
      const { tempFileName, filters, messageContent } = sendRequestSchema.parse(req.body);
      const tempPath = path.join(TEMP_DIR, tempFileName);

      // Save message content if provided
      if (messageContent) {
        const messagePath = path.join(FINAL_DIR, "message.txt");
        await writeFile(messagePath, messageContent, "utf-8");
      }

      if (!existsSync(tempPath)) {
        return res.status(404).json({ error: "Temporary file not found or expired" });
      }

      // Read temp file with cellDates: true
      const workbook = XLSX.readFile(tempPath, { cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: true,
      }) as any[][];

      let headers: string[] = [];
      let rows: any[][] = [];

      if (jsonData.length > 0) {
        headers = jsonData[0].map((h: any, i: number) => h ? String(h) : `Column ${i + 1}`);
        rows = jsonData.slice(1);
      }

      // Apply filters
      const filteredRows = filterRows(rows, headers, filters);

      // Create new workbook with filtered data
      // Note: filteredRows contains Date objects. json_to_sheet handles them.
      const newWorksheet = XLSX.utils.json_to_sheet([headers, ...filteredRows], { skipHeader: true });
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Customers");

      // Save to final destination
      XLSX.writeFile(newWorkbook, FINAL_FILE_PATH);

      // Send to WhatsApp API
      const phoneIdx = headers.indexOf("هاتف العميل");
      if (phoneIdx !== -1 && messageContent) {
        console.log("Starting WhatsApp broadcast...");
        let successCount = 0;
        let failCount = 0;
        let lastErrorStatus = 0;
        let hasNetworkError = false;

        // We use a loop to send messages sequentially to avoid overwhelming the local API
        for (const row of filteredRows) {
          const phone = String(row[phoneIdx] || "").trim();

          // Basic validation: ensure phone is not empty
          if (phone) {
            try {
              console.log(`Sending message to ${phone}...`);

              const token = process.env.WHATSAPP_API_TOKEN || "YOUR_TOKEN_HERE";

              if (token === "YOUR_TOKEN_HERE") {
                console.warn("Warning: Using placeholder token. API calls will likely fail.");
              }

              const response = await fetch("http://167.172.24.203:5001/wp/send?cid=default_client_id1", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  phone: phone,
                  message: messageContent,
                }),
              });

              if (response.ok) {
                successCount++;
              } else {
                console.error(`Failed to send to ${phone}: ${response.status} ${response.statusText}`);
                failCount++;
                lastErrorStatus = response.status;
              }
            } catch (error) {
              console.error(`Error sending to ${phone}:`, error);
              failCount++;
              hasNetworkError = true;
            }
          }
        }
        console.log(`Broadcast complete. Success: ${successCount}, Failed: ${failCount}`);

        if (failCount > 0) {
          if (hasNetworkError && lastErrorStatus === 0) {
            return res.status(502).json({ error: "حدث خطا ف الارسال الرجاء التحقق من الاتصال بالهاتف" });
          }

          switch (lastErrorStatus) {
            case 401:
              return res.status(502).json({ error: "حدث خطا ف الارسال الرجاء التاكد من النظام" });
            case 403:
              return res.status(502).json({ error: "غير مصرح لك بإرسال الرسائل، يرجى التحقق من الصلاحيات" });
            case 404:
              return res.status(502).json({ error: "الخدمة غير متوفرة حالياً" });
            case 429:
              return res.status(429).json({ error: "تم تجاوز حد الإرسال، يرجى المحاولة لاحقاً" });
            case 500:
              return res.status(502).json({ error: "خطأ في خادم الرسائل" });
            default:
              return res.status(502).json({ error: "حدث خطا ف الارسال الرجاء التاكد من النظام" });
          }
        }
      }

      res.json({ success: true, message: "File processed and saved successfully" });

    } catch (error) {
      console.error("Send error:", error);
      res.status(500).json({ error: "Failed to send file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
