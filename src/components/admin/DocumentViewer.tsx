
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, FileText, Image as ImageIcon } from "lucide-react";

interface DocumentViewerProps {
  documentUrl: string | null;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  buttonSize = "icon",
  buttonVariant = "ghost",
}) => {
  const [open, setOpen] = useState(false);

  if (!documentUrl) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="text-gray-400 cursor-not-allowed"
        title="No document available"
      >
        <FileText className="h-4 w-4" />
      </Button>
    );
  }

  const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(documentUrl);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(documentUrl, '_blank');
  };

  return (
    <>
      <div className="flex space-x-1">
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => setOpen(true)}
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
          title="View document"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={handleDownload}
          className="text-green-500 hover:text-green-700 hover:bg-green-100"
          title="Download document"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isPdf && <FileText className="h-5 w-5 text-red-500" />}
                {isImage && <ImageIcon className="h-5 w-5 text-blue-500" />}
                <span>Document Preview</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="ml-auto flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow overflow-auto bg-gray-100 rounded-md">
            {isPdf && (
              <iframe
                src={`${documentUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title="PDF Document Viewer"
              />
            )}
            
            {isImage && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={documentUrl}
                  alt="Document Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            {!isPdf && !isImage && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-6">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p>This file type cannot be previewed</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                    className="mt-4"
                  >
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentViewer;
