import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeView from "@/components/HomeView";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <HomeView />;
}
