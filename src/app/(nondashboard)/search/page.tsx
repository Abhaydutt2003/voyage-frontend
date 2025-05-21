"use client";
import { cleanParams } from "@/lib/utils";
import { useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { setFilters } from "@/state";
import { NAVBAR_HEIGHT } from "@/lib/constants";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }
        return acc;
      }
    );
    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  //search params can change, but we want to only read the initial search parameters.
  return (
    <div
      className="w-full mx-auto px-5 flex flex-col"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      {/* FiltersBar */}
      <>
      </>
    </div>
  );
};

export default SearchPage;
