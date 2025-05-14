import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Commit-Reveal2 Demo",
  description: "Commit-Reveal2 Demo",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col ">
        <Providers>
          <Header />
          <main
            className="flex-1 w-full min-h-[87vh] px-6 flex flex-col justify-center items-center text-center bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: "url('/map.png')" }}
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
