import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";
import { cn, formatPriceValue } from "@/lib/utils";
import { setFilters, setViewMode, toggleFiltersFullOpen } from "@/state";
import { searchLocationsOnMapbox } from "@/state/api/mapbox";
import { useAppSelector } from "@/state/redux";
import { Filter, Grid, List, Search } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { BedBathSelector } from "./BedBathSelector";
import useUpdateUrl from "@/hooks/useUpdateUrl";

//Does not make sense to out this comp in a new file, this is just used here, same for the other places where i have kept multiple comp in the same file.
const PriceRangeSelector: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  isMin: boolean;
}> = ({ value, onValueChange, isMin }) => {
  const options = isMin
    ? [500, 1000, 1500, 2000, 3000, 5000, 10000]
    : [1000, 2000, 3000, 5000, 10000];

  const placeholderText = isMin ? "Any Min Price" : "Any Max Price";

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className=" min-w-fit w-22 rounded-xl border-primary-400">
        <SelectValue>{formatPriceValue(Number(value), isMin)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="any">{placeholderText}</SelectItem>
        {options.map((price) => (
          <SelectItem key={price} value={price.toString()}>
            {isMin ? `$${price / 1000}k+` : `<$${price / 1000}k`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FiltersBar = () => {
  const { updateURL } = useUpdateUrl();
  const dispatch = useDispatch();

  const [viewMode, isFiltersFullOpen, filters] = useAppSelector((state) => [
    state.global.viewMode,
    state.global.isFiltersFullOpen,
    state.global.filters,
  ]);

  const [searchInput, setSearchInput] = useState(filters.location);

  const handleFilterChange = (
    key: string,
    value: string | [number, number],
    isMin: boolean | null
  ) => {
    let newValue;
    if (key == "priceRange" || key == "squareFeet") {
      const currentRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentRange;
    } else if ((key = "coordinates")) {
      newValue =
        value === "any"
          ? [0, 0]
          : Array.isArray(value)
          ? value.map(Number)
          : [0, 0];
    } else {
      newValue = value === "any" ? "any" : value;
    }
    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    try {
      const searchLocationData = await searchLocationsOnMapbox(searchInput);
      if (searchLocationData?.center) {
        const [lng, lat] = searchLocationData.center;
        dispatch(
          setFilters({
            location: searchInput,
            coordinates: [lng, lat],
          })
        );
      }
    } catch (error) {
      console.error("Error search location", error);
    }
  };

  return (
    <div className="flex justify-between items-center w-full py-5 ">
      {/* Filters */}
      <div className="flex items-center p-2 flex-wrap gap-2 ">
        {/* All Filters */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
            isFiltersFullOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>All Filters</span>
        </Button>
        {/* Search Location */}
        <div className="flex items-center">
          <Input
            placeholder="Search location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
          />
          <Button
            onClick={handleLocationSearch}
            className={`rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
              border hover:bg-primary-700 hover:text-primary-50`}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {/* Price Range */}
        <PriceRangeSelector
          value={filters.priceRange[0]?.toString() || "any"}
          onValueChange={(value) =>
            handleFilterChange("priceRange", value, true)
          }
          isMin={true}
        />
        <PriceRangeSelector
          value={filters.priceRange[1]?.toString() || "any"}
          onValueChange={(value) =>
            handleFilterChange("priceRange", value, false)
          }
          isMin={false}
        />

        {/* Beds and Baths */}
        <BedBathSelector
          value={filters.beds}
          onValueChange={(value) => handleFilterChange("beds", value, null)}
          type="beds"
        />
        <BedBathSelector
          value={filters.baths}
          onValueChange={(value) => handleFilterChange("baths", value, null)}
          type="baths"
        />
        {/* Property Type */}
        <Select
          value={filters.propertyType || "any"}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value, null)
          }
        >
          <SelectTrigger className=" min-w-fit w-32 rounded-xl border-primary-400">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="any">Any Property Type</SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* View Mode */}
      </div>
      <div className="flex justify-between items-center gap-4 p-2 ">
        <div className="flex border rounded-xl">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("list"))}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
