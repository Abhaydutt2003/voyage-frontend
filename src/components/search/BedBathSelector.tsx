import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";

interface BedBathSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  type: "beds" | "baths";
  className?: string;
}

export const BedBathSelector: React.FC<BedBathSelectorProps> = ({
  value,
  onValueChange,
  type,
  className,
}) => {
  const isBeds = type === "beds";
  const placeholderText = isBeds ? "Beds" : "Baths";
  const anyText = isBeds
    ? `Any ${isBeds ? "Beds" : "Baths"}`
    : `Any ${isBeds ? "Beds" : "Baths"}`;

  // Generate options up to a certain number
  const maxOptions = isBeds ? 4 : 3; // 4+ for beds, 3+ for baths
  const options = Array.from({ length: maxOptions }, (_, i) => i + 1);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "min-w-fit w-26 rounded-xl border-primary-400 ",
          className
        )}
      >
        {" "}
        {/* Apply className */}
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="any">{anyText}</SelectItem>
        {options.map((num) => (
          <SelectItem key={num} value={num.toString()}>
            {num}+ {isBeds ? "bed" : "bath"}
            {num > 1 && "s"} {/* Add 's' for plural */}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
