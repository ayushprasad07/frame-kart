

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <main className="flex-1 overflow-y-auto px-4">
              {/* <SidebarTrigger /> */}
              {children}
            </main>
    </div>
  );
}
