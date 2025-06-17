import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import { useCreateApplicationMutation } from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { ApplicationStatus } from "@/types/prismaTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";

import { LeaseDateRangePicker } from "./LeaseDateRangePicker";

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!authUser || authUser.userRole !== "tenant") {
      toast.error("You must be logged in as a tenant to submit an application");
      return;
    }
    const formData = new FormData();
    formData.append("startDate", data.startDate.toISOString());
    formData.append("endDate", data.endDate.toISOString());
    Object.entries(data).forEach(([key, value]) => {
      if (key === "paymentProof") {
        const files = value as File[];
        files.forEach((file: File) => {
          formData.append("paymentProof", file);
        });
      } else if (key !== "startDate" && key !== "endDate") {
        formData.append(key, String(value));
      }
    });
    formData.append("applicationDate", new Date().toISOString());
    formData.append("status", ApplicationStatus.Pending);
    formData.append("propertyId", String(propertyId));
    formData.append("tenantCognitoId", authUser.cognitoInfo.userId);
    console.log(formData);
    await createApplication(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>Submit Application for this Property</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 relative"
          >
            <CustomFormField
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your full name"
            />

            <CustomFormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
            />
            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              type="text"
              placeholder="Enter your phone number"
            />

            <LeaseDateRangePicker
              form={form}
              startDateFieldName="startDate"
              endDateFieldName="endDate"
              propertyId={propertyId}
            />

            <CustomFormField
              name="message"
              label="Message (Optional)"
              type="textarea"
              placeholder="Enter any additional information"
            />

            <CustomFormField
              name="paymentProof"
              label="Payment Proof"
              type="file"
            />

            <Button type="submit" className="bg-primary-700 text-white w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
