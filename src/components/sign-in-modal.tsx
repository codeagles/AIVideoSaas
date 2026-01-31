"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import * as Icons from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { toast } from "sonner";

type Dictionary = Record<string, string>;

interface SignInModalContentProps {
  lang: string;
  dict: Dictionary;
}

export const SignInModalContent = ({ lang, dict }: SignInModalContentProps) => {
  const signInModal = useSigninModal();
  const searchParams = useSearchParams();
  const [signInClicked, setSignInClicked] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const callbackURL = searchParams?.get("from") ?? `/${lang}${siteConfig.routes.defaultLoginRedirect}`;

  const handleSocialLogin = async (provider: "google") => {
    setSignInClicked(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
      // Modal will close automatically after redirect
    } catch (error) {
      console.error(`${provider} signIn error:`, error);
      setSignInClicked(null);
      toast.error("Login failed", {
        description: `Could not sign in with ${provider}. Please try again.`,
      });
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setSignInClicked("email");

    try {
      await authClient.signIn.magicLink({
        email: email.toLowerCase(),
        callbackURL,
      });

      toast.success("Check your email", {
        description: "We sent you a login link. Be sure to check your spam too.",
      });

      setEmail("");
      signInModal.onClose();
    } catch (error) {
      console.error("Magic link signIn error:", error);
      toast.error("Something went wrong", {
        description: "Your sign in request failed. Please try again.",
      });
    } finally {
      setSignInClicked(null);
    }
  };

  const isLoading = signInClicked !== null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center">
        <h3 className="font-urban text-2xl font-bold">
          {dict.signin_title || "Sign in to your account"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dict.signin_subtitle || "Get started with VideoFly today"}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8">
        {/* Google Login - Priority */}
        {siteConfig.auth.enableGoogleLogin && (
          <Button
            variant="default"
            className="w-full"
            disabled={isLoading}
            onClick={() => handleSocialLogin("google")}
          >
            {signInClicked === "google" ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Google className="mr-2 h-4 w-4" />
            )}
            {dict.continue_google || "Continue with Google"}
          </Button>
        )}

        {/* Magic Link Email Login */}
        {siteConfig.auth.enableMagicLinkLogin && (
          <>
            {siteConfig.auth.enableGoogleLogin && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-secondary/50 px-2 text-muted-foreground">
                    {dict.or_continue_with || "or continue with"}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleMagicLinkLogin} className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={cn(emailError && "border-red-500")}
                />
                {emailError && (
                  <p className="px-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                variant={siteConfig.auth.enableGoogleLogin ? "outline" : "default"}
                className="w-full"
                disabled={isLoading}
              >
                {signInClicked === "email" ? (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.Mail className="mr-2 h-4 w-4" />
                )}
                {dict.continue_email || "Continue with Email"}
              </Button>
            </form>
          </>
        )}

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground">
          {dict.terms_notice || "By continuing, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </div>
    </div>
  );
};

// Legacy component for backward compatibility
export const SignInModal = ({ lang, dict }: SignInModalContentProps) => {
  return <SignInModalContent lang={lang} dict={dict} />;
};

// Wrapper component for use with Modal
export function SignInModalWrapper({ lang, dict }: SignInModalContentProps) {
  return <SignInModalContent lang={lang} dict={dict} />;
}
