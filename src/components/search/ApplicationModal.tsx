import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import {
  CreateApplicationData,
  useCreateApplicationMutation,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { ApplicationStatus } from "@/types/prismaTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";

import { LeaseDateRangePicker } from "./LeaseDateRangePicker";
import { Loader2Icon } from "lucide-react";
import useUploadFile from "@/hooks/useFileUpload";

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();
  const [isApplicaitonSubmitting, setIsApplicationSubmitting] = useState(false);
  const { uploadFiles } = useUploadFile();

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
    setIsApplicationSubmitting(true);

    //upload files to s3 and the get the baseKeys to store in the database.
    const baseKeys = await uploadFiles({
      files: data.paymentProof,
      uploadType: "paymentProof",
    });

    //make the application.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { paymentProof, startDate, endDate, ...restApplicationData } = data;
    const dataToSend: CreateApplicationData = {
      ...restApplicationData,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      applicationDate: new Date().toISOString(),
      status: ApplicationStatus.Pending,
      propertyId: String(propertyId),
      tenantCognitoId: authUser.cognitoInfo.userId,
      paymentProofsBaseKeys: baseKeys,
    };
    await createApplication(dataToSend);
    onClose();
    setIsApplicationSubmitting(false);
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

            <Button
              type="submit"
              className="bg-primary-700 text-white w-full"
              disabled={isApplicaitonSubmitting}
            >
              {isApplicaitonSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Submitting
                </>
              ) : (
                <>Submit Application</>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
