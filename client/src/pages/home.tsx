import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload-zone";
import { FileInfoCard } from "@/components/file-info-card";
import { DataPreviewTable } from "@/components/data-preview-table";
import { AnimatedGradient } from "@/components/animated-gradient";
import { FileData } from "@shared/schema";
import { FileSpreadsheet } from "lucide-react";

export default function Home() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (data: FileData) => {
    setFileData(data);
    setIsUploading(false);
  };

  const handleRemoveFile = () => {
    setFileData(null);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedGradient />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  File Upload
                </h1>
                <p className="text-sm text-muted-foreground">
                  Upload & Preview Excel/CSV Files
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
              <div className="max-w-6xl mx-auto">
                <DataPreviewTable fileData={fileData} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              CSV files up to 1GB • Excel files up to 100MB
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
