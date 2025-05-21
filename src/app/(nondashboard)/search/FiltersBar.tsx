import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cleanParams, cn, debounce } from "@/lib/utils";
import { FiltersState, toggleFiltersFullOpen } from "@/state";
import { useAppSelector } from "@/state/redux";
import { Filter, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, isFiltersFullOpen, filters] = useAppSelector((state) => [
    state.global.viewMode,
    state.global.isFiltersFullOpen,
    state.global.filters,
  ]);

  const [searchInput, setSearchInput] = useState(filters.location);

  const updateUrl = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();
    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });
    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  }, 5);

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {};

  const handleLocationSearch = async ()=>{
    try{
      
    }catch(error){
      console.error("Error search location",error);
    }
  }

  return (
    <div className="flex justify-between items-center w-full py-5">
      {/* Filters */}
      <div className="flex justify-between items-center gap-4 p-2">
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
      </div>
    </div>
  );
};

export default FiltersBar;
