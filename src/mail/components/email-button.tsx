import { Button } from "@react-email/components";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

/**
 * Email Button Component
 *
 * Styled CTA button for emails
 * IMPORTANT: No hover states - email clients don't support them
 */
export default function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const styles = {
    primary:
      "bg-gray-900 text-white rounded-lg px-7 py-3.5 text-base font-bold",
    secondary:
      "bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-7 py-3.5 text-base font-bold",
  };

  return (
    <Button href={href} className={styles[variant]}>
      {children}
    </Button>
  );
}
