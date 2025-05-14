"use client";

import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white mt-10">
      <Link
        href="https://www.tokamak.network/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/tokamaklogo.png"
          alt="Tokamak Network Logo"
          width={32}
          height={32}
        />
      </Link>
      <Link
        href="https://github.com/tokamak-network/Commit-Reveal2-SimpleDemo"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 hover:text-black"
      >
        <FaGithub size={24} />
      </Link>
    </footer>
  );
}
