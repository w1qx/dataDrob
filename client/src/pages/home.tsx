import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { FileInfoCard } from "@/components/file-info-card";
import { DataPreviewTable } from "@/components/data-preview-table";
import { AnimatedGradient } from "@/components/animated-gradient";
import { FilterBar } from "@/components/filter-bar";
import { FileData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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
  const { toast } = useToast();

  const handleFileUpload = (data: FileData) => {
    setFileData(data);
    setFilteredRows(null); // Reset filters
    setFilteredTotal(null);
    setCurrentFilters({ neighborhoods: [], statuses: [], dateRange: undefined });
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    setFileData(null);
    setFilteredRows(null);
    setFilteredTotal(null);
    setCurrentFilters({ neighborhoods: [], statuses: [], dateRange: undefined });
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
          from: filters.dateRange.from?.toISOString(),
          to: filters.dateRange.to?.toISOString()
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
            from: currentFilters.dateRange.from?.toISOString(),
            to: currentFilters.dateRange.to?.toISOString()
          } : undefined
        }
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
        description: "حدث خطأ أثناء ارسال الملف",
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
        <AnimatedGradient />

        <div className="w-full max-w-6xl glass-card rounded-3xl p-6 md:p-10 animate-in fade-in zoom-in duration-500">
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
                <h1 className="text-4xl font-bold text-gradient tracking-tight">
                  مؤسسة باداود لتحلية المياه
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
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
        </div>
      </div>
    </div >
  );
}
