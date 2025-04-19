import Link from "next/link";

import Header from "@/components/base/header";
import { ArrowLeft } from "lucide-react";

export default async function SiteSubPageHeader({
  backLink,
  backText,
}: {
  backLink: string;
  backText: string;
}) {
  return (
    <Header>
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href={backLink} className="mr-6 flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold">{backText}</span>
          </Link>
        </div>
      </div>
    </Header>
  );
}
