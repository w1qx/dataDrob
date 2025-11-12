import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileData } from "@shared/schema";
import { FileSpreadsheet, X, Upload } from "lucide-react";

interface FileInfoCardProps {
  fileData: FileData;
  onRemove: () => void;
}

export function FileInfoCard({ fileData, onRemove }: FileInfoCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileTypeLabel = (type: string): string => {
    if (type.includes("spreadsheetml")) return "Excel";
    if (type.includes("ms-excel")) return "Excel";
    if (type.includes("csv")) return "CSV";
    return "Unknown";
  };

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm" data-testid="card-file-info">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Icon */}
        <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground truncate" data-testid="text-filename">
              {fileData.fileName}
            </h3>
            <Badge variant="secondary" data-testid="badge-filetype">
              {getFileTypeLabel(fileData.fileType)}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span data-testid="text-filesize">{formatFileSize(fileData.fileSize)}</span>
            <span className="text-border">•</span>
            <span data-testid="text-rowcount">{fileData.totalRows.toLocaleString()} rows</span>
            <span className="text-border">•</span>
            <span data-testid="text-columncount">{fileData.columnCount} columns</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            size="default"
            onClick={onRemove}
            className="flex-1 lg:flex-initial"
            data-testid="button-remove"
          >
            <X className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Remove</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={onRemove}
            className="flex-1 lg:flex-initial"
            data-testid="button-upload-another"
          >
            <Upload className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Upload Another</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
