export function SiteFrame({
  children,
  navigation,
  footer,
}: {
  children: React.ReactNode;
  navigation: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      {navigation}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
