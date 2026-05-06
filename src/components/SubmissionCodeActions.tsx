"use client";

import Link from "next/link";
import { PencilLine } from "lucide-react";
import { CopyCodeButton } from "@/components/CopyCodeButton";

type SubmissionCodeActionsProps = {
  code: string;
  continueHref?: string;
};

export function SubmissionCodeActions({
  code,
  continueHref,
}: SubmissionCodeActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyCodeButton code={code} />
      {continueHref ? (
        <Link className="btn btn-primary px-3 py-2" href={continueHref}>
          <PencilLine size={15} />
          继续修改
        </Link>
      ) : null}
    </div>
  );
}
