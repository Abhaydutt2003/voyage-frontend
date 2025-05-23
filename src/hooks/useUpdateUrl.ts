import { cleanParams, debounce } from "@/lib/utils";
import { FiltersState } from "@/state";
import { usePathname, useRouter } from "next/navigation";

const useUpdateUrl = () => {
  const router = useRouter();
  const pathname = usePathname();

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  }, 300);
  return { updateURL };
};

export default useUpdateUrl;
