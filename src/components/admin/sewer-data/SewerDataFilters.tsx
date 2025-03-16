
import { useState, useEffect } from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { SewerTreatmentPlant } from "./types";

interface SewerDataFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (newDate: DateRange | undefined) => void;
  plantFilter: string;
  onPlantFilterChange: (value: string) => void;
  waterType: string;
  onWaterTypeChange: (value: string) => void;
  plants?: SewerTreatmentPlant[];
}

const SewerDataFilters = ({
  dateRange,
  onDateRangeChange,
  plantFilter,
  onPlantFilterChange,
  waterType,
  onWaterTypeChange,
  plants,
}: SewerDataFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DatePickerWithRange
        date={dateRange}
        onDateChange={(newDate: DateRange | undefined) => 
          onDateRangeChange(newDate || { from: undefined, to: undefined })
        }
      />
      <Select value={waterType} onValueChange={onWaterTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by water type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="inlet_water">Inlet Water</SelectItem>
          <SelectItem value="outlet_water">Outlet Water</SelectItem>
        </SelectContent>
      </Select>
      <Select value={plantFilter} onValueChange={onPlantFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by plant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plants</SelectItem>
          {plants?.map(plant => (
            <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SewerDataFilters;
