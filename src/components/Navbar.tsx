"use client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <Link href="/dashboard" className="font-semibold text-sm">
        Optymalizacja Trasy
      </Link>
      <UserButton />
    </nav>
  );
}
