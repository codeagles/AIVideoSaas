"use client";

import { SignInModalContent } from "@/components/sign-in-modal";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { useMounted } from "@/hooks/use-mounted";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const ModalProvider = ({
  dict,
  locale,
  children,
}: {
  dict: Record<string, unknown>;
  locale: string;
  children: React.ReactNode;
}) => {
  const mounted = useMounted();
  const signInModal = useSigninModal();

  return (
    <>
      {children}
      {mounted && (
        <Dialog open={signInModal.isOpen} onOpenChange={(open) => {
          if (open) {
            signInModal.onOpen();
          } else {
            signInModal.onClose();
          }
        }}>
          <DialogContent className="p-0 gap-0 max-w-md">
            {/* Hidden title for accessibility */}
            <DialogTitle className="sr-only">
              Sign In
            </DialogTitle>
            <SignInModalContent lang={locale} dict={dict as Record<string, string>} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
