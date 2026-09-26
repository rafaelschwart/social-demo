import { AccountsView } from "@/components/analytics-dashboard/accounts-view";
import { snapshot } from "@/lib/snapshot";

export const metadata = { title: "Connected accounts" };

export default function AccountsPage() {
  return <AccountsView snapshot={snapshot} />;
}
