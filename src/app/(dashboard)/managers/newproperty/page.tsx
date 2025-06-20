"use client";
import { PropertyFormData, propertySchema } from "@/lib/schemas";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useCreatePropertyMutation } from "@/state/api/propertyEndpoints";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Amenity, Highlight } from "@/types/prismaTypes";
import { PropertyTypeEnum } from "@/lib/constants";
import { useRouter } from "next/navigation";

const NewProperty = () => {
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerNight: 30,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: [],
      highlights: [],
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (!authUser?.cognitoInfo?.userId) {
      throw new Error("No manager ID found");
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "photoUrls") {
        const files = value as File[];
        files.forEach((file: File) => {
          formData.append("photos", file);
        });
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    formData.append("managerCognitoId", authUser.cognitoInfo.userId);
    await createProperty(formData);
    router.push("/managers/properties");
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />
      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-10"
          >
            {/* Basic Information & Price */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField name="name" label="Property Name" />
                <CustomFormField
                  name="pricePerNight"
                  label="Price per Night"
                  type="number"
                />
              </div>
              <div className="mt-4">
                <CustomFormField
                  name="description"
                  label="Description"
                  type="textarea"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Property Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField
                  name="beds"
                  label="Number of Beds"
                  type="number"
                />
                <CustomFormField
                  name="baths"
                  label="Number of Baths"
                  type="number"
                />
                <CustomFormField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Pets Allowed"
                  type="switch"
                />
                <CustomFormField
                  name="isParkingIncluded"
                  label="Parking Included"
                  type="switch"
                />
              </div>
              <div className="mt-4">
                <CustomFormField
                  name="propertyType"
                  label="Property Type"
                  type="select"
                  options={Object.keys(PropertyTypeEnum).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Amenities and Highlights */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Amenities and Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  name="amenities"
                  label="Amenities"
                  type="multi-select"
                  options={Object.keys(Amenity).map((amenity) => ({
                    value: amenity,
                    label: amenity,
                  }))}
                />
                <CustomFormField
                  name="highlights"
                  label="Highlights"
                  type="multi-select"
                  options={Object.keys(Highlight).map((highlight) => ({
                    value: highlight,
                    label: highlight,
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Photos */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <CustomFormField
                name="photoUrls"
                label="Property Photos"
                type="file"
                accept="image/*"
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Property Address */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Property Address</h2>
              <CustomFormField name="address" label="Street Address" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="city" label="City" />
                <CustomFormField name="state" label="State/Province" />
                <CustomFormField name="postalCode" label="Postal Code" />
              </div>
              <CustomFormField name="country" label="Country" />
            </div>

            <Button
              type="submit"
              className="bg-primary-700 text-white w-full mt-8"
            >
              Create Property
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
