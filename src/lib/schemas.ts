import * as z from "zod";
import { PropertyTypeEnum } from "./constants";

export const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "max words 500"),
  pricePerNight: z.coerce.number().positive().min(0).int(),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),
  propertyImages: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required"),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  highlights: z.array(z.string()).min(1, "At least one highlight is required"),
  beds: z.coerce.number().positive().min(0).max(10).int(),
  baths: z.coerce.number().positive().min(0).max(10).int(),
  squareFeet: z.coerce.number().int().positive(),
  propertyType: z.nativeEnum(PropertyTypeEnum),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export const propertyLocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type PropertyLocationData = z.infer<typeof propertyLocationSchema>;

export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().max(100).optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  paymentProof: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
