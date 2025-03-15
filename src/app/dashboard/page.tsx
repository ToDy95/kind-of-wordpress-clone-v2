import React from "react";
import { DashboardCard } from "@/app/_components/dashboard-card";
import { serverApi } from "@/trpc/server";
import { auth } from "@/server/auth";
import { SessionProvider } from "next-auth/react";

const Dashboard = async () => {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const initialData = await serverApi.post.getAll();

  return (
    <div className="container mx-auto p-6">
      <SessionProvider session={session}>
        <DashboardCard initialData={initialData} />
      </SessionProvider>
    </div>
  );
};

export default Dashboard;
