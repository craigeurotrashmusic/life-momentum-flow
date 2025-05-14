
// src/hooks/use-toast.ts
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastInternal,
} from "@/components/ui/use-toast";

export const useToast = useToastInternal;

export type { Toast, ToastProps, ToastActionElement };
export { toast } from "@/components/ui/use-toast";
