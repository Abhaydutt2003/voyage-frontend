"use client";
import {
  Authenticator,
  useAuthenticator,
  View,
  Heading,
  RadioGroupField,
  Radio,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import RouteGaurd from "./RouteGaurd";
import { Map } from "lucide-react";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOl_CLIENT_ID!,
    },
  },
});

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7 ">
        <div className="flex flex-row items-center gap-3">
          <Map className=" w-6 h-6" />
          <Heading level={3} className="!text-2xl !font-bold flex flex-row">
            <span>VOYAGE</span>
          </Heading>
        </div>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Welcome!</span> Please sign in to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up here
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();
      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "john_doe123",
      label: "Username",
      isRequired: true,
      pattern: "[\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]+",
      descriptiveText: "Letters, numbers, symbols, and punctuation allowed.",
    },
    email: {
      order: 2,
      placeholder: "john@example.com",
      label: "Email",
      isRequired: true,
      descriptiveText:
        "We'll use this for account verification and important updates",
    },
    password: {
      order: 3,
      placeholder: "Create a strong password",
      label: "Password",
      isRequired: true,
      pattern: "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      descriptiveText:
        "Use at least 8 characters with a mix of letters, numbers, and symbols",
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
      descriptiveText: "Please enter the same password again to confirm",
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");

  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [isAuthPage, router, user]);

  //Allow access to public pages for non auth users.
  if (!isAuthPage && !isDashboardPage && !user) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        formFields={formFields}
        components={components}
      >
        {() => <RouteGaurd>{children}</RouteGaurd>}
      </Authenticator>
    </div>
  );
};

export default Auth;
