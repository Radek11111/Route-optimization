"use client";

import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function HomeView() {
  return (
    <>
      <div className="w-full ">
        <Image
          src="/truck.jpg"
          alt="ciężarówka"
          width={1025}
          height={1000}
          className="object-cover blur-xs"
          priority
        />

        <div className="flex items-center justify-center h-screen">
          <SignIn routing="hash"/>
        </div>
      </div>
    </>
  );
}
