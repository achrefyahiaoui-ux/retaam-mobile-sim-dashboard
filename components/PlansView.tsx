"use client";
import { SingleTableView } from "@/components/SingleTableView";

export function PlansView() {
  return (
    <SingleTableView
      endpoint="/api/plans"
      title="قائمة الباقات"
      accent="plum"
      addLabel="إضافة باقة"
      addTitle="إضافة باقة جديدة"
      description="إدارة قائمة الباقات. يمكنك إضافة باقة جديدة وإرسالها مباشرة إلى n8n."
    />
  );
}
