import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Application {
  id: string;
  tracking_number: string;
  applicant_name: string;
  mobile_number: string;
  email: string;
  shop_registration_number: string;
  status: string;
  created_at: string;
}

const TrackApplication = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });
    fetchApplications();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    setUserRole(data?.role || null);
  };

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('license_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500';
      case 'under_review':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar session={session} userRole={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading applications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} userRole={userRole} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Track Your Applications</h1>
        
        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const currentStep = getStatusStep(app.status);
              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{app.applicant_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tracking: <span className="font-mono font-bold text-blue-600">{app.tracking_number}</span>
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {getStatusText(app.status)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Shop Reg: {app.shop_registration_number} • Applied on {new Date(app.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Tracker */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`rounded-full p-2 ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`}>
                          <FileCheck className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <p className="text-sm mt-2 font-medium">Submitted</p>
                      </div>
                      
                      <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                      
                      <div className="flex flex-col items-center flex-1">
                        <div className={`rounded-full p-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}>
                          <Clock className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <p className="text-sm mt-2 font-medium">Under Review</p>
                      </div>
                      
                      <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                      
                      <div className="flex flex-col items-center flex-1">
                        <div className={`rounded-full p-2 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}>
                          <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <p className="text-sm mt-2 font-medium">Approved</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Mobile</p>
                        <p className="font-medium">{app.mobile_number}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{app.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrackApplication;
