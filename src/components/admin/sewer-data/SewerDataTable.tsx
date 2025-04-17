
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import DocumentViewer from "../DocumentViewer";
import { SewerQualityData } from "./types";

// List of plant names to exclude
const excludedPlantNames = [
  "Motijheel WTP - Motijheel Area",
  "Maharajpura STP - Maharajpura",
  "Morar STP - Morar Region",
  "Hazira STP - Hazira Area",
  "Lashkar STP - Lashkar Region",
  "Jhansi Road STP - Jhansi Road"
];

interface SewerDataTableProps {
  data: SewerQualityData[];
  isLoading?: boolean;
}

const SewerDataTable = ({ data, isLoading }: SewerDataTableProps) => {
  if (isLoading) return (
    <div className="flex justify-center items-center p-8">
      <p className="text-lg">Loading sewer treatment data...</p>
    </div>
  );

  // Filter out excluded plants from the displayed data
  const filteredData = data.filter(
    record => !excludedPlantNames.includes(record.sewer_treatment_plants?.name || '')
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData?.length === 0 && (
            <TableRow>
              <TableCell colSpan={14} className="text-center py-4">No data found for the selected filters</TableCell>
            </TableRow>
          )}
          {filteredData?.map((record) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SewerDataTable;
