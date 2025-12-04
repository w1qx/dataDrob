import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileData, MAX_FILE_SIZE_CSV, MAX_FILE_SIZE_EXCEL } from "@shared/schema";
import { CloudUpload, FileSpreadsheet, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadZoneProps {
  onUpload: (data: FileData) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

export function FileUploadZone({ onUpload, isUploading, setIsUploading }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv'];

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return "نوع الملف غير صالح. يرجى رفع ملفات Excel (.xlsx, .xls) أو CSV";
    }

    // Different size limits for Excel vs CSV
    const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';
    const maxSize = isExcel ? MAX_FILE_SIZE_EXCEL : MAX_FILE_SIZE_CSV;
    const maxSizeLabel = isExcel ? "100 ميجابايت" : "1 جيجابايت";

    if (file.size > maxSize) {
      return `حجم ملف ${isExcel ? 'Excel' : 'CSV'} يتجاوز حد ${maxSizeLabel}${isExcel ? '. للملفات الأكبر، يرجى التحويل إلى صيغة CSV.' : ''}`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: validationError,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest("POST", "/api/upload", formData);
      const data = await response.json() as FileData;

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onUpload(data);
        toast({
          title: "تم الرفع بنجاح",
          description: `تمت معالجة ملف ${file.name} بنجاح`,
        });
      }, 300);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: error instanceof Error ? error.message : "فشل في معالجة الملف",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-8 font-['Cairo']">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-semibold text-foreground cursor-default select-none">
          اسحب الملف هنا
        </h2>
        <p className="text-base text-muted-foreground cursor-default select-none">
          قم برفع الملفات لمعاينة بياناتك
        </p>
      </div>

      {isUploading ? (
        <Card className="min-h-64 lg:min-h-80 p-8 border-2 border-dashed border-border bg-card/80 backdrop-blur-sm">
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-md space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    جارٍ معالجة الملف...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
              <Progress value={uploadProgress} className="h-2" data-testid="progress-upload" />
            </div>
          </div>
        </Card>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 ease-out
            flex flex-col items-center justify-center p-12 text-center cursor-pointer
            group hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/20"
              : "border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60"
            }
          `}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className={`
            p-8 rounded-full bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 mb-8
            group-hover:scale-110 transition-transform duration-500 shadow-inner
            relative
          `}>
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Upload className={`
              h-16 w-16 text-primary relative z-10
              ${isDragging ? "animate-bounce" : "group-hover:text-cyan-600"}
              transition-colors duration-300
            `} />
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors duration-300 tracking-tight cursor-default select-none">
              {isDragging ? "ضع الملف هنا" : "سحب  ملف "}
            </h3>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed font-medium cursor-default select-none">
              قم بسحب الملف هنا، أو انقر لاختيار ملف من جهازك
            </p>
          </div>

          <div className="mt-10">
            <Button
              variant="outline"
              className="rounded-full px-10 py-7 text-xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-input')?.click();
              }}
            >
              استعراض الملفات
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl group-hover:bg-cyan-400/10 transition-colors duration-500"></div>
        </div>
      )}
    </div>
  );
}
