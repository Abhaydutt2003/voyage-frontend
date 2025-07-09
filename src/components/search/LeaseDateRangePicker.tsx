import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { format, isWithinInterval } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useGetAcceptedLeaseQuery } from "@/state/api/propertyEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";

interface LeaseDateRangePickerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  startDateFieldName: string;
  endDateFieldName: string;
  propertyId: number;
}

export const LeaseDateRangePicker: React.FC<LeaseDateRangePickerProps> = ({
  form,
  startDateFieldName,
  endDateFieldName,
  propertyId,
}) => {
  const { data: authUser } = useGetAuthUserQuery();
  const startDate = form.watch(startDateFieldName);
  const endDate = form.watch(endDateFieldName);

  // State to control popover visibility
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // State to control the month shown in the start date calendar
  const [startDateCalendarMonth, setStartDateCalendarMonth] = useState<
    Date | undefined
  >(undefined);
  // State to control the month shown in the end date calendar
  const [endDateCalendarMonth, setEndDateCalendarMonth] = useState<
    Date | undefined
  >(undefined);

  const { data: acceptedLeasesData } = useGetAcceptedLeaseQuery(
    {
      propertyId,
    },
    {
      skip:
        !authUser?.cognitoInfo.userId ||
        typeof authUser.cognitoInfo.userId !== "string",
    }
  );

  // Function to check if a date overlaps with any existing lease
  const isDateOverlapping = (date: Date) => {
    if (!acceptedLeasesData) return false;

    return acceptedLeasesData.some((lease) => {
      const leaseStart = new Date(lease.startDate);
      const leaseEnd = new Date(lease.endDate);

      return isWithinInterval(date, {
        start: leaseStart,
        end: leaseEnd,
      });
    });
  };

  // Function to check if a date range overlaps with any existing lease
  const isDateRangeOverlapping = (start: Date, end: Date) => {
    if (!acceptedLeasesData) return false;

    return acceptedLeasesData.some((lease) => {
      const leaseStart = new Date(lease.startDate);
      const leaseEnd = new Date(lease.endDate);

      return (
        isWithinInterval(start, {
          start: leaseStart,
          end: leaseEnd,
        }) ||
        isWithinInterval(end, {
          start: leaseStart,
          end: leaseEnd,
        }) ||
        (start <= leaseStart && end >= leaseEnd)
      );
    });
  };

  // NEW: Effect to reset end date if start date changes
  React.useEffect(() => {
    if (startDate && endDate) {
      // If endDate is before or same as startDate, or if startDate changes, reset endDate
      if (endDate <= startDate) {
        form.setValue(endDateFieldName, null);
      }
    }
    // Always set the end date calendar to the start date's month when startDate changes
    if (startDate) {
      setEndDateCalendarMonth(new Date(startDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  // Effect to keep startDateCalendarMonth in sync with startDate
  React.useEffect(() => {
    if (startDate) {
      setStartDateCalendarMonth(new Date(startDate));
    }
  }, [startDate]);

  return (
    <div className="flex flex-row gap-4">
      <FormField
        control={form.control}
        name={startDateFieldName}
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1">
            <FormLabel>Start Date</FormLabel>
            <Popover
              open={startDateOpen}
              onOpenChange={(open) => {
                setStartDateOpen(open);
                // When opening, set the calendar month to the selected start date (if any)
                if (open && startDate) {
                  setStartDateCalendarMonth(new Date(startDate));
                }
              }}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  month={startDateCalendarMonth}
                  onMonthChange={setStartDateCalendarMonth}
                  onSelect={(date) => {
                    // If the start date changes, reset the end date
                    if (date !== startDate) {
                      form.setValue(endDateFieldName, null);
                    }
                    field.onChange(date);
                    if (date) {
                      setStartDateOpen(false);
                      setEndDateOpen(true);
                      setEndDateCalendarMonth(new Date(date)); // Set end date calendar to start date's month
                    }
                  }}
                  disabled={(date) =>
                    date < new Date() ||
                    date >
                      new Date(
                        new Date().setMonth(new Date().getMonth() + 6)
                      ) ||
                    isDateOverlapping(date)
                  }
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={endDateFieldName}
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1">
            <FormLabel>End Date</FormLabel>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={!startDate}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : !startDate ? (
                      <span className="text-muted-foreground">
                        Select start date first
                      </span>
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  // Show the calendar month as the start date's month
                  month={endDateCalendarMonth}
                  onMonthChange={setEndDateCalendarMonth}
                  onSelect={(date) => {
                    if (
                      date &&
                      startDate &&
                      !isDateRangeOverlapping(startDate, date)
                    ) {
                      field.onChange(date);
                      setEndDateOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    if (!startDate) return true;
                    const minDate = new Date(startDate);
                    minDate.setDate(minDate.getDate() + 1);
                    const maxDate = new Date(startDate);
                    maxDate.setMonth(maxDate.getMonth() + 6);
                    return (
                      date < minDate ||
                      date > maxDate ||
                      isDateOverlapping(date) ||
                      isDateRangeOverlapping(startDate, date)
                    );
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
  );
};
