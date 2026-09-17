import { EmployerTabs } from "@/components/layout/employer-tabs";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <EmployerTabs />
      {children}
    </div>
  );
}
