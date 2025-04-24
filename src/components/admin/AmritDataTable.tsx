
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ParameterValue } from "@/components/ui/parameter-value";
import { amritLimits } from "@/utils/parameterLimits";

interface AmritDataTableProps {
  data: any[];
  isLoading: boolean;
}

const AmritDataTable = ({ data, isLoading }: AmritDataTableProps) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Ward No.</TableHead>
          <TableHead>Connection No.</TableHead>
          <TableHead>pH Value</TableHead>
          <TableHead>TDS</TableHead>
          <TableHead>Conductivity CL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
            <TableCell>{record.customer_name}</TableCell>
            <TableCell>{record.ward_no}</TableCell>
            <TableCell>{record.connection_number}</TableCell>
            <TableCell>
              <ParameterValue
                value={record.ph_value}
                limit={amritLimits.ph_value}
                label="pH Value"
              />
            </TableCell>
            <TableCell>
              <ParameterValue
                value={record.tds}
                limit={amritLimits.tds}
                label="TDS"
              />
            </TableCell>
            <TableCell>
              <ParameterValue
                value={record.conductivity_cl}
                limit={amritLimits.conductivity_cl}
                label="Conductivity CL"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AmritDataTable;
