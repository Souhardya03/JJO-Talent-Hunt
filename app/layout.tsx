import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JJO Talent Hunt 2026",
  description: "Join the JJO Talent Hunt 2026, the ultimate platform for young performers to showcase their skills in singing, dance, and more. Register now to compete and win!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full font-roboto flex flex-col">
        <Toaster/>
        {children}</body>
    </html>
  );
}
