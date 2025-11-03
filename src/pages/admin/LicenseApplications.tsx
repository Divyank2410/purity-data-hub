import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, CheckCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Application {
  id: string;
  applicant_name: string;
  mobile_number: string;
  email: string;
  shop_registration_number: string;
  status: string;
  documents_url: string[];
  created_at: string;
  user_id: string;
}

const LicenseApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [licenseData, setLicenseData] = useState({
    licenseNumber: "",
    approvalDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
  });

  useEffect(() => {
    checkAdmin();
    fetchApplications();
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

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('license_applications')
        .select('*')
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

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('license_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application marked as ${newStatus.replace('_', ' ')}`,
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      // Create license
      const { error: licenseError } = await supabase
        .from('licenses')
        .insert({
          application_id: selectedApp.id,
          user_id: selectedApp.user_id,
          license_number: licenseData.licenseNumber,
          approval_date: licenseData.approvalDate,
          expiry_date: licenseData.expiryDate,
        });

      if (licenseError) throw licenseError;

      // Update application status
      await updateStatus(selectedApp.id, 'approved');

      // Create notification
      await supabase
        .from('license_notifications')
        .insert({
          license_id: (await supabase
            .from('licenses')
            .select('id')
            .eq('application_id', selectedApp.id)
            .single()).data?.id,
          user_id: selectedApp.user_id,
          notification_type: 'approved',
          message: `Your license application has been approved. License Number: ${licenseData.licenseNumber}`,
        });

      setShowApprovalDialog(false);
      setSelectedApp(null);
      setLicenseData({
        licenseNumber: "",
        approvalDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
      });

      toast({
        title: "License Approved",
        description: "License has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
        <h1 className="text-3xl font-bold">License Applications</h1>
        <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Manage and review license applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Shop Reg No.</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.applicant_name}</TableCell>
                  <TableCell>{app.shop_registration_number}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{app.mobile_number}</div>
                      <div className="text-muted-foreground">{app.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {app.status === 'submitted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(app.id, 'under_review')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                      {app.status === 'under_review' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowApprovalDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {app.documents_url && app.documents_url.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(app.documents_url[0], '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Docs
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve License Application</DialogTitle>
            <DialogDescription>
              Enter license details for {selectedApp?.applicant_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={licenseData.licenseNumber}
                onChange={(e) => setLicenseData({ ...licenseData, licenseNumber: e.target.value })}
                placeholder="e.g., WL-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvalDate">Approval Date *</Label>
              <Input
                id="approvalDate"
                type="date"
                value={licenseData.approvalDate}
                onChange={(e) => setLicenseData({ ...licenseData, approvalDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={licenseData.expiryDate}
                onChange={(e) => setLicenseData({ ...licenseData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              Approve License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LicenseApplications;
