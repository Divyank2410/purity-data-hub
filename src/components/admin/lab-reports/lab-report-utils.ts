
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { LabTest } from "../AdminLabReports";

export function downloadAsExcel(data: LabTest[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(row => ({
      "Sample ID": row.sample_id,
      "Date": row.collection_date,
      "Status": row.document_url ? "Available" : "Missing",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Reports");
  XLSX.writeFile(workbook, "lab-reports.xlsx");
  toast.success("Excel file downloaded successfully");
}
