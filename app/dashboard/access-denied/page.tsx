import { redirect } from "next/navigation";

export default function DashboardAccessDeniedPage() {
  redirect("/access-denied");
}
