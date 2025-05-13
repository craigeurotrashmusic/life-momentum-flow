
export interface SlideProps {
  onNext: () => void;
  isSubmitting?: boolean;
  setIsSubmitting?: (value: boolean) => void;
  onBack?: () => void; // Add optional back button handler
}
