import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileUploadZone } from "@/components/file-upload-zone";
import { FileInfoCard } from "@/components/file-info-card";
import { DataPreviewTable } from "@/components/data-preview-table";
import { Scene3D } from "@/components/scene-3d";
import { FilterBar } from "@/components/filter-bar";
import { FileData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileSpreadsheet, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filteredRows, setFilteredRows] = useState<any[][] | null>(null);
  const [filteredTotal, setFilteredTotal] = useState<number | null>(null);
  const [currentFilters, setCurrentFilters] = useState<{
    neighborhoods: string[];
    statuses: string[];
    dateRange: { from?: Date; to?: Date } | undefined;
  }>({ neighborhoods: [], statuses: [], dateRange: undefined });
  const [isSending, setIsSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const { toast } = useToast();

  // Fetch current file on mount
  useEffect(() => {
    const fetchCurrentFile = async () => {
      try {
        const response = await apiRequest("GET", "/api/current-file");
        if (response.ok) {
          const data = await response.json();
          setFileData(data);
        }
      } catch (error) {
        console.error("Failed to fetch current file:", error);
      }
    };
    fetchCurrentFile();
  }, []);

  const handleFileUpload = (data: FileData) => {
    setFileData(data);
    setFilteredRows(null); // Reset filters
    setFilteredTotal(null);
    setCurrentFilters({ neighborhoods: [], statuses: [], dateRange: undefined });
    setIsUploading(false);
  };

  const handleRemoveFile = async () => {
    try {
      await apiRequest("DELETE", "/api/current-file");
      setFileData(null);
      setFilteredRows(null);
      setFilteredTotal(null);
      setCurrentFilters({ neighborhoods: [], statuses: [], dateRange: undefined });
    } catch (error) {
      console.error("Failed to remove file:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف الملف",
      });
    }
  };

  const handleFilterChange = async (filters: {
    neighborhoods: string[];
    statuses: string[];
    dateRange: { from?: Date; to?: Date } | undefined;
  }) => {
    if (!fileData) return;
    setCurrentFilters(filters);

    // If no filters, reset to original data
    if (filters.neighborhoods.length === 0 && filters.statuses.length === 0 && !filters.dateRange) {
      setFilteredRows(null);
      setFilteredTotal(null);
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/filter", {
        filePath: fileData.tempFileName, // Use temp file
        neighborhoods: filters.neighborhoods,
        statuses: filters.statuses,
        dateRange: filters.dateRange ? {
          from: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
          to: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined
        } : undefined
      });

      const result = await response.json();
      setFilteredRows(result.rows);
      setFilteredTotal(result.totalRows);
    } catch (error) {
      console.error("Filter error:", error);
    }
  };

  const handleSend = async () => {
    if (!fileData) return;
    setIsSending(true);

    try {
      await apiRequest("POST", "/api/send", {
        tempFileName: fileData.tempFileName,
        filters: {
          neighborhoods: currentFilters.neighborhoods,
          statuses: currentFilters.statuses,
          dateRange: currentFilters.dateRange ? {
            from: currentFilters.dateRange.from ? format(currentFilters.dateRange.from, 'yyyy-MM-dd') : undefined,
            to: currentFilters.dateRange.to ? format(currentFilters.dateRange.to, 'yyyy-MM-dd') : undefined
          } : undefined
        },
        messageContent
      });

      toast({
        title: "تم الارسال بنجاح",
        description: "تم حفظ الملف وتطبيق التصفية بنجاح",
      });

      // Optional: Reset or keep state? Let's keep state so they can send again if needed.
    } catch (error) {
      console.error("Send error:", error);
      toast({
        variant: "destructive",
        title: "فشل الارسال",
        description: error instanceof Error ? error.message : "حدث خطا ف الارسال الرجاء التحقق من الاتصال بالهاتف",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Construct display data based on filters
  const displayData = fileData ? {
    ...fileData,
    rows: filteredRows || fileData.rows,
    totalRows: filteredTotal !== null ? filteredTotal : fileData.totalRows
  } : null;

  return (
    <div className="min-h-screen relative">

      <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-['Cairo'] relative overflow-hidden">
        <div className="relative z-10 w-full max-w-6xl glass-card rounded-3xl p-6 md:p-10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col gap-8">

            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pb-6 border-b border-gray-100/50">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="relative h-24 w-auto object-contain drop-shadow-md transform transition-transform group-hover:scale-105 duration-300"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-gradient tracking-tight cursor-default select-none">
                  مؤسسة باداود لتحلية المياه
                </h1>
                <p className="text-muted-foreground font-medium text-lg cursor-default select-none">
                  خدمات تحلية مياه عالية الجودة
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {!fileData ? (
                <FileUploadZone
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 delay-150">
                  <FileInfoCard
                    fileData={fileData}
                    onRemove={handleRemoveFile}
                  />

                  <div className="glass-panel rounded-2xl p-6 shadow-sm">
                    <FilterBar
                      neighborhoods={fileData.uniqueNeighborhoods || []}
                      statuses={fileData.uniqueStatuses || []}
                      onFilterChange={handleFilterChange}
                    />

                    <div className="mt-6">
                      {displayData && (
                        <DataPreviewTable
                          fileData={{
                            ...fileData,
                            rows: displayData.rows,
                            totalRows: displayData.totalRows
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-primary cursor-default select-none">نوع الرسالة</h3>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setMessageContent("عرض خاص! احصل على خصم 20% على جميع خدمات تحلية المياه لفترة محدودة. اتصل بنا الآن!")}
                          className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all duration-300"
                        >
                          ترويج
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setMessageContent("نود تذكيركم بموعد الصيانة الدورية لجهاز التحلية الخاص بكم. يرجى التواصل معنا لتحديد موعد مناسب.")}
                          className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all duration-300"
                        >
                          صيانة
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground cursor-default select-none">نص الرسالة</label>
                      <Textarea
                        placeholder="اكتب نص الرسالة هنا..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="min-h-[120px] bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-gray-700 focus:border-primary resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      className="bg-[#6AC1E8] hover:bg-[#5AB1D8] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 min-w-[200px] text-lg h-12 rounded-full"
                      onClick={handleSend}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          جاري الارسال...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          ارسال
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <footer className="mt-12 pt-8 border-t border-gray-100/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo and Company Name (Right side in RTL) */}
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto opacity-90" />
                <span className="font-bold text-gray-700 dark:text-gray-200 cursor-default select-none">مؤسسة باداود لتحلية المياه</span>
              </div>

              {/* Copyright and Credits (Left side in RTL) */}
              <div className="flex flex-col items-center md:items-end gap-1 text-sm text-muted-foreground/80 cursor-default select-none">
                <p>© {new Date().getFullYear()} كل الحقوق محفوظة</p>
                <p className="text-xs">
                  تم التطوير بواسطة <span className="text-primary font-bold">وليد الغامدي</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
