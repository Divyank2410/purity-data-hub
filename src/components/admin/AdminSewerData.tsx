
import { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import SewerDataFilters from "./sewer-data/SewerDataFilters";
import SewerDataTable from "./sewer-data/SewerDataTable";
import { useSewerData } from "./sewer-data/useSewerData";

export const SEWER_DATA_QUERY_KEY = "sewerData";

const AdminSewerData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [plantFilter, setPlantFilter] = useState("all");
  const [waterType, setWaterType] = useState("all");

  const { sewerData, plants, isLoading } = useSewerData(
    dateRange,
    plantFilter,
    waterType
  );

  return (
    <div className="space-y-4">
      <SewerDataFilters 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        plantFilter={plantFilter}
        onPlantFilterChange={setPlantFilter}
        waterType={waterType}
        onWaterTypeChange={setWaterType}
        plants={plants}
      />

      <SewerDataTable 
        data={sewerData || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminSewerData;
