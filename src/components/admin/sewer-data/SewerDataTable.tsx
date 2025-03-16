
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import DocumentViewer from "../DocumentViewer";
import { SewerQualityData } from "./types";

interface SewerDataTableProps {
  data: SewerQualityData[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const SewerDataTable = ({ data, onDelete, isLoading }: SewerDataTableProps) => {
  if (isLoading) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-lg">Loading sewer treatment data...</p>
    </div>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Plant Name</TableHead>
            <TableHead>Plant Location</TableHead>
            <TableHead>Plant Capacity</TableHead>
            <TableHead>Water Type</TableHead>
            <TableHead>BOD</TableHead>
            <TableHead>COD</TableHead>
            <TableHead>pH Value</TableHead>
            <TableHead>TSS</TableHead>
            <TableHead>Ammonical Nitrogen</TableHead>
            <TableHead>Total Nitrogen</TableHead>
            <TableHead>Total Phosphorus</TableHead>
            <TableHead>Fecal Coliform</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={15} className="text-center py-4">No data found for the selected filters</TableCell>
            </TableRow>
          )}
          {data?.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{record.sewer_treatment_plants?.name || 'N/A'}</TableCell>
              <TableCell>{record.sewer_treatment_plants?.location || 'N/A'}</TableCell>
              <TableCell>{record.sewer_treatment_plants?.capacity || 'N/A'}</TableCell>
              <TableCell>{record.water_type}</TableCell>
              <TableCell>{record.bod || 'N/A'}</TableCell>
              <TableCell>{record.cod || 'N/A'}</TableCell>
              <TableCell>{record.ph_value || 'N/A'}</TableCell>
              <TableCell>{record.tss || 'N/A'}</TableCell>
              <TableCell>{record.ammonical_nitrogen || 'N/A'}</TableCell>
              <TableCell>{record.total_nitrogen || 'N/A'}</TableCell>
              <TableCell>{record.total_phosphorus || 'N/A'}</TableCell>
              <TableCell>{record.fecal_coliform || 'N/A'}</TableCell>
              <TableCell>
                <DocumentViewer documentUrl={record.document_url} />
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this sewer quality record? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => onDelete(record.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SewerDataTable;
