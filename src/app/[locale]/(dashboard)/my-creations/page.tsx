import { MyCreationsPage } from "@/components/creation/my-creations-page";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function MyCreationsRoute({ params }: PageProps) {
  const { locale } = await params;
  return <MyCreationsPage locale={locale} />;
}
