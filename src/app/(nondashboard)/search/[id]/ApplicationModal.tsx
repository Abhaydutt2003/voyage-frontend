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
    await createApplication({
      ...data,
      applicationDate: new Date().toISOString(),
      status: ApplicationStatus.Pending,
      propertyId: propertyId,
      tenantCognitoId: authUser.cognitoInfo.userId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white"></DialogContent>
      <DialogHeader className="mb-4">
        <DialogTitle>Submit Application for this Property</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <CustomFormField
            name="name"
            label="Name"
            type="text"
            placeholder="Enter your full name"
          />
        </form>
      </Form>
    </Dialog>
  );
};

export default ApplicationModal;
