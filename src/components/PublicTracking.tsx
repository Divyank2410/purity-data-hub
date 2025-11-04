import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileCheck, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  tracking_number: string;
  applicant_name: string;
  shop_registration_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const PublicTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('license_applications')
        .select('*')
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setApplication(null);
          toast({
            title: "Not Found",
            description: "No application found with this tracking number",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setApplication(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'approved':
        return 3;
      default:
        return 0;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      default:
        return status;
    }
  };

  return (
    <section className="mb-12">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-2xl">Track Your License Application</CardTitle>
          <CardDescription className="text-base">
            Enter your tracking number to check the status of your water supply license application
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Enter tracking number (e.g., WL-20240101-ABC123)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              className="text-lg"
            />
            <Button 
              onClick={handleTrack} 
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Track
                </>
              )}
            </Button>
          </div>

          {searched && application && (
            <div className="mt-8 space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="text-lg font-bold text-blue-600">{application.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applicant Name</p>
                    <p className="text-lg font-semibold">{application.applicant_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shop Registration Number</p>
                    <p className="text-lg font-semibold">{application.shop_registration_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Application Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="p-6 bg-white border-2 border-blue-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-6">Application Progress</h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`rounded-full p-3 ${getStatusStep(application.status) >= 1 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}>
                      <FileCheck className={`h-6 w-6 ${getStatusStep(application.status) >= 1 ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-sm mt-2 font-medium text-center">Submitted</p>
                    {getStatusStep(application.status) >= 1 && (
                      <Badge className="mt-1 bg-green-500">Completed</Badge>
                    )}
                  </div>
                  
                  <div className={`flex-1 h-2 mx-2 ${getStatusStep(application.status) >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`} />
                  
                  <div className="flex flex-col items-center flex-1">
                    <div className={`rounded-full p-3 ${getStatusStep(application.status) >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}>
                      <Clock className={`h-6 w-6 ${getStatusStep(application.status) >= 2 ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-sm mt-2 font-medium text-center">Under Review</p>
                    {getStatusStep(application.status) === 2 && (
                      <Badge className="mt-1 bg-yellow-500">In Progress</Badge>
                    )}
                    {getStatusStep(application.status) > 2 && (
                      <Badge className="mt-1 bg-green-500">Completed</Badge>
                    )}
                  </div>
                  
                  <div className={`flex-1 h-2 mx-2 ${getStatusStep(application.status) >= 3 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`} />
                  
                  <div className="flex flex-col items-center flex-1">
                    <div className={`rounded-full p-3 ${getStatusStep(application.status) >= 3 ? 'bg-green-600' : 'bg-gray-300'} transition-colors`}>
                      <CheckCircle2 className={`h-6 w-6 ${getStatusStep(application.status) >= 3 ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <p className="text-sm mt-2 font-medium text-center">Approved</p>
                    {getStatusStep(application.status) >= 3 && (
                      <Badge className="mt-1 bg-green-500">Completed</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-lg">
                    <span className="font-semibold">Current Status:</span>{" "}
                    <span className="text-blue-600 font-bold">{getStatusText(application.status)}</span>
                  </p>
                  {application.status === 'approved' && (
                    <p className="text-center text-sm text-green-600 mt-2">
                      🎉 Congratulations! Your license has been approved. Check your dashboard for license details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {searched && !application && !loading && (
            <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg text-center">
              <p className="text-red-600 font-semibold">
                No application found with tracking number: {trackingNumber}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Please check your tracking number and try again
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PublicTracking;
