import type { Metadata } from "next";
import { Geist, Geist_Mono,Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ['latin'] });

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rakto Sewa - Blood Donation Platform",
  description: "Connect blood donors with organizations in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
      className={`${inter.className} bg-[#f8f6f6] dark:bg-[#221010] text-[#181111] dark:text-white overflow-x-hidden antialiased`}>
      
          {children}
          <Toaster position="top-center" />
       
      </body>
    </html>
  );
}
