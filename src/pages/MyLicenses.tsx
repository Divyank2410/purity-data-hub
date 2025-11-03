import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface License {
  id: string;
  license_number: string;
  approval_date: string;
  expiry_date: string;
  created_at: string;
}

const MyLicenses = () => {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
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
    fetchLicenses();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    setUserRole(data?.role || null);
  };

  const fetchLicenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
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

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar session={session} userRole={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading licenses...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} userRole={userRole} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Licenses</h1>
        
        {licenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No licenses found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {licenses.map((license) => (
              <Card key={license.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>License #{license.license_number}</CardTitle>
                    {isExpired(license.expiry_date) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : isExpiringSoon(license.expiry_date) ? (
                      <Badge className="bg-yellow-500">Expiring Soon</Badge>
                    ) : (
                      <Badge className="bg-green-500">Active</Badge>
                    )}
                  </div>
                  <CardDescription>
                    Issued on {new Date(license.approval_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isExpiringSoon(license.expiry_date) && !isExpired(license.expiry_date) && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Expiring Soon</AlertTitle>
                      <AlertDescription>
                        This license will expire on {new Date(license.expiry_date).toLocaleDateString()}. Please renew before expiry.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isExpired(license.expiry_date) && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>License Expired</AlertTitle>
                      <AlertDescription>
                        This license expired on {new Date(license.expiry_date).toLocaleDateString()}. Please apply for renewal.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">License Number</p>
                      <p className="font-medium">{license.license_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approval Date</p>
                      <p className="font-medium">{new Date(license.approval_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{new Date(license.expiry_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {isExpired(license.expiry_date) ? 'Expired' : 'Active'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyLicenses;
