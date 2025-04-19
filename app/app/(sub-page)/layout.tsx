import SiteSubPageHeader from "@/components/domain/site/site-sub-page-header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteSubPageHeader
        backLink="/app/dashboard"
        backText="ダッシュボードに戻る"
      />
      {children}
    </>
  );
}
