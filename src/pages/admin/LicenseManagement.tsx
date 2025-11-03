import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface License {
  id: string;
  license_number: string;
  approval_date: string;
  expiry_date: string;
  created_at: string;
  user_id: string;
  application_id: string;
}

interface ApplicationData {
  applicant_name: string;
  email: string;
  mobile_number: string;
}

interface LicenseWithApplication extends License {
  application?: ApplicationData;
}

const LicenseManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<LicenseWithApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    fetchLicenses();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/');
    }
  };

  const fetchLicenses = async () => {
    try {
      const { data: licensesData, error: licensesError } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (licensesError) throw licensesError;

      // Fetch application data for each license
      const licensesWithApplications = await Promise.all(
        (licensesData || []).map(async (license) => {
          const { data: appData } = await supabase
            .from('license_applications')
            .select('applicant_name, email, mobile_number')
            .eq('id', license.application_id)
            .single();

          return {
            ...license,
            application: appData || undefined
          };
        })
      );

      setLicenses(licensesWithApplications);
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

  const getStatusBadge = (expiryDate: string) => {
    if (isExpired(expiryDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon(expiryDate)) {
      return <Badge className="bg-yellow-500">Expiring Soon</Badge>;
    }
    return <Badge className="bg-green-500">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">License Management</h1>
        <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Expiring Soon Alert */}
      {licenses.some(l => isExpiringSoon(l.expiry_date)) && (
        <Card className="mb-6 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Licenses Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {licenses.filter(l => isExpiringSoon(l.expiry_date)).length} license(s) will expire within 30 days
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Licenses</CardTitle>
          <CardDescription>View and manage all issued licenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Number</TableHead>
                <TableHead>License Holder</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Approval Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-medium">{license.license_number}</TableCell>
                  <TableCell>{license.application?.applicant_name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{license.application?.mobile_number || 'N/A'}</div>
                      <div className="text-muted-foreground">{license.application?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(license.approval_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={isExpiringSoon(license.expiry_date) || isExpired(license.expiry_date) ? 'text-red-500 font-medium' : ''}>
                      {new Date(license.expiry_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(license.expiry_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseManagement;
