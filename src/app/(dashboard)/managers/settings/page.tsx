"use client";

import SettingsForm from "@/components/SettingForm";
import { withToast } from "@/lib/utils";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useUpdateManagerSettingsMutation } from "@/state/api/managerEndpoints";

import React from "react";

const ManagerSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.userInfo.name,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await withToast(
      updateManager({
        cognitoId: authUser?.cognitoInfo?.userId ?? "",
        ...data,
      }),
      {
        error: "Failed to update settings.",
      }
    );
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="manager"
    />
  );
};

export default ManagerSettings;
