import { statusClassName } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex min-w-[7.75rem] items-center justify-center border px-2.5 py-1 text-xs font-bold ${statusClassName(status)}`}
    >
      {status}
    </span>
  );
}
