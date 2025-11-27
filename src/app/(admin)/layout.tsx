
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
// import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrameKart - Your Frame & Artwork Store",
  description: "Discover beautiful frames and artwork for your home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    //   >
        <div>
          <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 overflow-y-auto px-4">
                    <SidebarTrigger />
                    {children}
                  </main>
          </SidebarProvider>
        </div>
    //   </body>
    // </html>
  );
}
