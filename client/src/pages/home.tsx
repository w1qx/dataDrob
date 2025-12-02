import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { FileInfoCard } from "@/components/file-info-card";
import { DataPreviewTable } from "@/components/data-preview-table";
import { AnimatedGradient } from "@/components/animated-gradient";
import { FilterBar } from "@/components/filter-bar";
import { FileData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
      <AnimatedGradient />

      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-white/90 flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/logo.png" alt="Badawood Foundation Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-['Cairo']">
                  مؤسسة باداود لتحلية المياه
                </h1>
                <p className="text-sm text-muted-foreground font-['Cairo']">
                  Badawood Water Desalination Foundation
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 lg:px-8 pb-16">
          {!fileData ? (
            <div className="max-w-4xl mx-auto">
              <FileUploadZone
                onUpload={handleFileUpload}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <FileInfoCard
                  fileData={fileData}
                  onRemove={handleRemoveFile}
                />
              </div>

              <div className="max-w-6xl mx-auto space-y-4">
                <FilterBar
                  neighborhoods={fileData.uniqueNeighborhoods || []}
                  statuses={fileData.uniqueStatuses || []}
                  onFilterChange={handleFilterChange}
                />

                {displayData && <DataPreviewTable fileData={displayData} />}

                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    onClick={handleSend}
                    disabled={isSending}
                    className="gap-2 font-['Cairo'] min-w-[150px]"
                  >
                    {isSending ? (
                      "جارٍ الارسال..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        ارسال
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground font-['Cairo']">
              CSV حتى 1 جيجابايت • Excel حتى 100 ميجابايت
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
