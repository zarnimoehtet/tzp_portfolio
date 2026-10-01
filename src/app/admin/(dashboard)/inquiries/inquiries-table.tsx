"use client";

import { useState, useTransition } from "react";
import { Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog, useConfirm } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteInquiry, setInquiryStatus } from "@/lib/actions/inquiries";
import { formatDate } from "@/lib/format";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const FILTERS = ["all", "new", "read", "archived"] as const;
type Filter = (typeof FILTERS)[number];

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [, startTransition] = useTransition();
  const confirm = useConfirm();

  const visible =
    filter === "all" ? inquiries.filter((i) => i.status !== "archived") : inquiries.filter((i) => i.status === filter);

  function changeStatus(inquiry: Inquiry, status: InquiryStatus) {
    startTransition(async () => {
      const result = await setInquiryStatus(inquiry.id, status);
      if (!result.ok) toast.error(result.error);
    });
  }

  function open(inquiry: Inquiry) {
    setSelected(inquiry);
    if (inquiry.status === "new") changeStatus(inquiry, "read");
  }

  return (
    <>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-0">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <ul className="divide-y">
            {visible.map((inquiry) => (
              <li key={inquiry.id} className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => open(inquiry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {inquiry.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {inquiry.email}
                    </span>
                    {inquiry.status === "new" && <Badge>New</Badge>}
                    {inquiry.package_name && (
                      <Badge variant="outline">{inquiry.package_name}</Badge>
                    )}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{inquiry.message}</p>
                </button>
                <time className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {formatDate(inquiry.created_at)}
                </time>
                <div className="flex shrink-0 gap-1">
                  {inquiry.status !== "archived" ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Archive"
                      onClick={() => changeStatus(inquiry, "archived")}
                    >
                      <Archive />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Restore"
                      onClick={() => changeStatus(inquiry, "read")}
                    >
                      <MailOpen />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() =>
                      confirm.ask(async () => {
                        const result = await deleteInquiry(inquiry.id);
                        if (!result.ok) toast.error(result.error);
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  Received {formatDate(selected.created_at, { hour: "numeric", minute: "2-digit" })}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                {[
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                  ["Occasion", selected.event_type],
                  ["Date", selected.event_date && formatDate(selected.event_date)],
                  ["Package", selected.package_name],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="col-span-2 break-words">{value}</dd>
                    </div>
                  ))}
              </dl>
              <p className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                {selected.message}
              </p>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: your photography inquiry")}`}
                className={buttonVariants({ className: "justify-self-start" })}
              >
                <Mail /> Reply by email
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.onConfirm}
        title="Delete inquiry?"
        description="This message will be permanently removed."
      />
    </>
  );
}
