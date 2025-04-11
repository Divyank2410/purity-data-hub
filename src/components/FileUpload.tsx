
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (filePath: string) => void;
  onFileUpload?: (filePath: string) => void; // For backward compatibility
  bucketName?: string;
  folderPath?: string;
  userId?: string;
  fileType?: "water" | "sewer" | "amrit" | "lab";
}

const FileUpload = ({ 
  onUploadComplete, 
  onFileUpload,
  bucketName = "water-mgmt-files", 
  folderPath = "documents", 
  userId, 
  fileType = "water" 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Validate file type (PDF or image)
    const fileType = selectedFile.type;
    if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
      toast.error("Only PDF and image files are allowed");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      // Create a unique file name to prevent collisions
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${folderPath}-${userId || Date.now()}-${Date.now()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the file
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Call both callbacks for backward compatibility
      onUploadComplete(data.publicUrl);
      if (onFileUpload) {
        onFileUpload(data.publicUrl);
      }
      
      toast.success("File uploaded successfully");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => document.getElementById(`file-upload-${fileType}`)?.click()}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Select File
        </Button>
        <input
          id={`file-upload-${fileType}`}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm">
            <File size={16} className="text-blue-500" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <button 
              type="button" 
              onClick={clearSelectedFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      {selectedFile && (
        <Button 
          type="button" 
          onClick={handleUpload} 
          disabled={uploading} 
          className="w-full sm:w-auto"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
