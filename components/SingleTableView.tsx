"use client";
import useSWR from "swr";
import { DataTable } from "@/components/DataTable";

type Payload = { data: Record<string, unknown>[]; fetchedAt: string };

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as Payload;
  });

type Props = {
  endpoint: string;
  title: string;
  accent?: "signal" | "teal" | "amber" | "plum";
};

export function SingleTableView({ endpoint, title, accent = "teal" }: Props) {
  const { data, error, isLoading } = useSWR<Payload>(
    endpoint,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  return (
    <DataTable
      title={title}
      data={data?.data ?? []}
      isLoading={isLoading}
      error={!!error}
      accent={accent}
    />
  );
}
