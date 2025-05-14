"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Header() {
  return (
    <header
      className={`${inter.className} flex items-center justify-between px-6 py-4 border-b border-gray-200 shadow-sm bg-white`}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <Image
            src="/tokamaklogo.png"
            alt="Tokamak Network Logo"
            width={40}
            height={40}
          />
          <h1 className="text-xl font-semibold">Commit-Reveal2 Demo</h1>
        </Link>
        <nav className="ml-6 flex gap-4">
          <Link href="/how-it-works" className="text-sm font-medium hover:underline">
            How It Works
          </Link>
          <Link href="/run-a-node" className="text-sm font-medium hover:underline">
            Run a Node
          </Link>
        </nav>
      </div>
      <ConnectButton />
    </header>
  );
}
