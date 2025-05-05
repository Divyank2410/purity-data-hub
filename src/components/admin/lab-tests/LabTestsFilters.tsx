
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, FilterX } from "lucide-react";

interface LabTestsFiltersProps {
  filters: {
    sampleId: string;
    submitterName: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  };
  setFilters: (filters: any) => void;
  sorting: {
    column: string;
    direction: string;
  };
  setSorting: (sorting: any) => void;
}

const LabTestsFilters = ({
  filters,
  setFilters,
  sorting,
  setSorting,
}: LabTestsFiltersProps) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateRange.from
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.dateRange.to);

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
    setFilters({
      ...filters,
      dateRange: { from, to },
    });
  };

  const resetFilters = () => {
    setFilters({
      sampleId: "",
      submitterName: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const sortOptions = [
    { value: "created_at", label: "Date (Newest)" },
    { value: "created_at:asc", label: "Date (Oldest)" },
    { value: "submitter_name:asc", label: "Name (A-Z)" },
    { value: "submitter_name:desc", label: "Name (Z-A)" },
    { value: "sample_id:asc", label: "Sample ID (A-Z)" },
    { value: "sample_id:desc", label: "Sample ID (Z-A)" },
  ];

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split(":");
    setSorting({
      column,
      direction: direction || "desc",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="text-lg font-medium">Filters</h3>
        <div className="flex gap-2 items-center">
          <Label htmlFor="sort-by">Sort by:</Label>
          <Select
            value={`${sorting.column}${
              sorting.direction !== "desc" ? ":asc" : ""
            }`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger id="sort-by" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sample-id">Sample ID</Label>
          <Input
            id="sample-id"
            placeholder="Search by Sample ID"
            value={filters.sampleId}
            onChange={(e) =>
              setFilters({ ...filters, sampleId: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submitter-name">Submitter Name</Label>
          <Input
            id="submitter-name"
            placeholder="Search by Name"
            value={filters.submitterName}
            onChange={(e) =>
              setFilters({ ...filters, submitterName: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-grow justify-start"
                  disabled={!dateFrom && !dateTo}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom && dateTo
                    ? `${format(dateFrom, "PP")} - ${format(dateTo, "PP")}`
                    : "Select date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateFrom}
                  selected={{
                    from: dateFrom,
                    to: dateTo,
                  }}
                  onSelect={(range) =>
                    handleDateChange(range?.from, range?.to)
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="flex gap-1 items-center"
        >
          <FilterX className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default LabTestsFilters;
