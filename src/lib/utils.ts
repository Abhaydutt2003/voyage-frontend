/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts "MyEnumValue" to "My Enum Value"
 * @param str
 * @returns
 */
export function formatEnumString(str: string) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

export function formatPriceValue(value: number | null, isMin: boolean) {
  if (value === null || value === 0 || isNaN(value))
    return isMin ? "Any Min Price" : "Any Max Price";
  if (value >= 1000) {
    const kValue = value / 1000;
    return isMin ? `$${kValue}k+` : `<$${kValue}k`;
  }
  return isMin ? `$${value}+` : `<$${value}`;
}

export function cleanParams(params: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(params).filter(
      (
        [_, value] // eslint-disable-line @typescript-eslint/no-unused-vars
      ) =>
        value !== undefined &&
        value !== "any" &&
        value !== "" &&
        (Array.isArray(value) ? value.some((v) => v !== null) : value !== null)
    )
  );
}

type MutationMessages = {
  success?: string;
  error: string;
};

/**
 * Defines the structure for conditional error messages based on status codes.
 */
type ConditionalErrorMessages = {
  [statusCode: number]: string;
};

/**
 * Wraps the mutation function with toast .
 * @param mutationFn
 * @param messages
 * @returns
 */
export const withToast = async <T>(
  mutationFn: Promise<T>,
  messages: Partial<MutationMessages> & {
    conditionalErrors?: ConditionalErrorMessages;
  }
) => {
  const { success, error, conditionalErrors } = messages;

  try {
    const result = await mutationFn;
    if (success) toast.success(success);
    return result;
  } catch (err) {
    let errorMessage = error; //default message
    if (err && typeof err === "object" && "error" in err) {
      const { error } = err;
      if (error && typeof error === "object" && "status" in error) {
        const { status } = error;
        if (conditionalErrors && conditionalErrors[status as number]) {
          errorMessage = conditionalErrors[status as number];
        }
      }
    }
    if (errorMessage) toast.error(errorMessage);
  }
};

export const createNewUserInDatabase = async (
  user: any,
  idToken: any,
  userRole: string,
  fetchWithBQ: any
) => {
  const createEndpoint =
    userRole?.toLowerCase() === "manager" ? "/managers" : "/tenants";

  const createUserResponse = await fetchWithBQ({
    url: createEndpoint,
    method: "POST",
    body: {
      cognitoId: user.userId,
      name: user.username,
      email: idToken?.payload?.email || "",
      phoneNumber: "",
    },
  });

  if (createUserResponse.error) {
    throw new Error("Failed to create user record");
  }

  return createUserResponse;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>): void => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const handleShare = async (propertyId: string) => {
  const shareUrl = `${window.location.origin}/api/share/${propertyId}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied successfully!");
  } catch (error) {
    console.log(error);
    toast.error("Failed to copy link");
  }
};
