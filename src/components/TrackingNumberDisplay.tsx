import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackingNumberDisplayProps {
  trackingNumber: string;
  onClose: () => void;
}

const TrackingNumberDisplay = ({ trackingNumber, onClose }: TrackingNumberDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: "Copied!",
      description: "Tracking number copied to clipboard",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Tracking Number</p>
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{trackingNumber}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ✓ Your application has been submitted successfully
            </p>
            <p className="text-sm text-muted-foreground">
              ✓ Use this tracking number to check your application status
            </p>
            <p className="text-sm text-muted-foreground">
              ✓ You can track your application on the homepage
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Number
            </Button>
            <Button
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Please save this tracking number for future reference
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingNumberDisplay;
