
import React from "react";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Search } from "lucide-react";

interface LabReportFilterProps {
  search: string;
  setSearch: (v: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (r: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function LabReportFilter({
  search,
  setSearch,
  dateRange,
  setDateRange
}: LabReportFilterProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row gap-2">
      <div className="relative max-w-xs">
        <Input
          placeholder="Search by Sample ID or Date"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs border-[#7E69AB] pl-9"
        />
        <div className="absolute left-3 top-2.5 text-[#9b87f5] pointer-events-none">
          <Search className="h-4 w-4" />
        </div>
      </div>
      <DatePickerWithRange
        date={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
        onDateChange={d => setDateRange({ from: d?.from, to: d?.to })}
      />
    </div>
  );
}
