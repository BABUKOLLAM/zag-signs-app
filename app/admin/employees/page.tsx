import { redirect } from "next/navigation";

// Employee records are managed in the HR module
export default function AdminEmployeesRedirect() {
  redirect("/hr");
}
