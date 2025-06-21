"use client";
import { cleanParams } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { setFilters } from "@/state";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import FiltersBar from "@/components/search/FiltersBar";
import FiltersFull from "@/components/search/FiltersFull";
import Map from "@/components/search/Map";
import Listings from "@/components/search/Listings";
import Navbar from "@/components/Navbar";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "lat") {
          if (!acc["coordinates"]) {
            acc["coordinates"] = new Array(2).fill(0);
          }
          acc["coordinates"][0] = value.split(",").map(Number);
        } else if (key === "lng") {
          if (!acc["coordinates"]) {
            acc["coordinates"] = new Array(2).fill(0);
          }
          acc["coordinates"][1] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }
        return acc;
      },
      {}
    );
    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  //search params can change, but we want to only read the initial search parameters.

  return (
    <div className=" h-full w-full">
      <Navbar />
      <main
        className="h-full flex w-full flex-col"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        <div
          className="w-full mx-auto px-5 flex flex-col"
          style={{
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          }}
        >
          <FiltersBar />
          <div className="flex justify-between flex-1 overflow-hidden gap-3 mb-5">
            <div
              className={`h-full overflow-auto transition-all duration-300 ease-in-out ${
                isFiltersFullOpen
                  ? "w-3/12 opacity-100 visible"
                  : "w-0 opacity-0 invisible"
              }`}
            >
              <FiltersFull />
            </div>
            <Map />
            <div className="basis-4/12 overflow-y-auto">
              <Listings />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
