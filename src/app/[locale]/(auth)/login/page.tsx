import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/components/ui";
import { buttonVariants } from "@/components/ui/button";
import * as Icons from "@/components/ui/icons";

import { UserAuthForm } from "@/components/user-auth-form";
import type { Locale } from "@/config/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{
    locale: Locale;
  }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${locale}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.ChevronLeft className="mr-2 h-4 w-4" />
          {dict.login.back}
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Image
            src="/images/avatars/saasfly-logo.svg"
            className="mx-auto"
            width="64"
            height="64"
            alt=""
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {dict.login.welcome_back}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.login.signin_title}
          </p>
        </div>
        <Suspense fallback={<div className="h-10" />}>
          <UserAuthForm lang={locale} dict={dict.login} />
        </Suspense>
        {/* <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href={`/${locale}/register`}
            className="hover:text-brand underline underline-offset-4"
          >
            {dict.login.singup_title}
          </Link>
        </p> */}
      </div>
    </div>
  );
}
