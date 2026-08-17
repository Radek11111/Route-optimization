import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <div className="w-full ">
        <Image
          src="/truck1.jpg"
          alt="ciężarówka"
          fill
          className="object-cover blur-xs "
          priority
        />

        <div className="flex items-center justify-center h-screen">
          <SignUp routing="hash" />
        </div>
      </div>
    </>
  );
}
