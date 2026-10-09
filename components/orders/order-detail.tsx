"use client";

import { AlertTriangle, Loader2, MessageCircle, PackageCheck } from "lucide-react";
import { useState } from "react";
import { StickyActionBar, StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { SellerCard } from "@/components/listings/seller-card";
import { HeldFundsCard } from "@/components/payments/held-funds-card";
import { OrderStatus } from "@/components/payments/order-status";
import { PaymentSummary } from "@/components/payments/payment-summary";
import { SafetyTip } from "@/components/payments/safety-notice";
import { TransactionTimeline } from "@/components/payments/transaction-timeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { useToast } from "@/components/ui/toast";
import { confirmReceipt, markHandedOver } from "@/lib/api";
import { formatDateTime, formatNaira, shortName } from "@/lib/formatters";
import { applyConfirmReceipt, applyDispute, applyHandover, canDispute } from "@/lib/order-state";
import type { Order, User } from "@/lib/types";
import { DisputeSheet } from "./dispute-sheet";
import { ReviewForm } from "./review-form";

export function OrderDetail({
  initialOrder,
  counterparty,
  perspective,
}: {
  initialOrder: Order;
  counterparty: User;
  perspective: "buyer" | "seller";
}) {
  const toast = useToast();
  const [order, setOrder] = useState(initialOrder);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isBuyer = perspective === "buyer";
  const other = shortName(counterparty.name);
  const doneWord = order.kind === "item" ? "got the item" : "the job is done";

  const confirm = async () => {
    setBusy(true);
    await confirmReceipt(order.id);
    setOrder((o) => applyConfirmReceipt(o, new Date().toISOString()));
    setBusy(false);
    setConfirmOpen(false);
    toast(`Done! ${formatNaira(order.amount)} released to ${other}.`);
  };

  const handover = async () => {
    setBusy(true);
    await markHandedOver(order.id);
    setOrder((o) => applyHandover(o, new Date().toISOString()));
    setBusy(false);
    toast("Marked as handed over. We've asked the buyer to confirm.");
  };

  const primary = (() => {
    if (isBuyer && (order.status === "handed-over" || order.status === "held")) {
      return (
        <Button size="lg" className="flex-1" onClick={() => setConfirmOpen(true)}>
          <PackageCheck aria-hidden className="h-5 w-5" />
          {order.kind === "item" ? "I got the item" : "Job is done"}
        </Button>
      );
    }
    if (!isBuyer && order.status === "held") {
      return (
        <Button size="lg" className="flex-1" onClick={handover} disabled={busy}>
          {busy && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          Mark as handed over
        </Button>
      );
    }
    return null;
  })();

  return (
    <div className="space-y-5 md:grid md:grid-cols-[1fr_360px] md:gap-6 md:space-y-0">
      <div className="space-y-5">
        <HeldFundsCard order={order} perspective={perspective} />

        {order.status === "disputed" && (
          <Card role="status" className="flex gap-3 border-danger/30 bg-danger-soft p-4">
            <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="font-bold text-danger">Dispute under review</p>
              <p className="text-sm">
                Money remains safely held while we review the case. We may message both of you for more details.
              </p>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <SectionHeader title="Progress" as="h2" />
          <TransactionTimeline steps={order.timeline} disputed={order.status === "disputed"} />
        </Card>

        {order.status === "completed" && (
          <ReviewForm targetId={counterparty.id} targetName={other} context={order.title} kind={order.kind} />
        )}

        {isBuyer && order.status === "handed-over" && (
          <SafetyTip>
            Only tap “{order.kind === "item" ? "I got the item" : "Job is done"}” once you have checked everything.
            After you confirm, the money goes to {other} and can&apos;t be reversed.
          </SafetyTip>
        )}
      </div>

      <div className="space-y-5">
        <Card className="p-4">
          <div className="flex gap-3">
            <PlaceholderImage title={order.title} className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="font-semibold">{order.title}</p>
              <p className="text-sm text-muted">{order.fulfilment}</p>
              <OrderStatus status={order.status} className="mt-1" />
            </div>
          </div>
          <PaymentSummary
            className="mt-4 border-t border-border pt-4"
            amount={order.amount}
            fee={order.fee}
            perspective={perspective}
          />
          <p className="mt-3 text-xs text-muted">
            Order {order.id} · Placed {formatDateTime(order.createdAt)}
          </p>
        </Card>

        <SellerCard seller={counterparty} role={isBuyer ? (order.kind === "item" ? "Seller" : "Provider") : "Buyer"} />

        <div className="hidden space-y-2 md:block">
          {primary && <div className="flex">{primary}</div>}
          <ButtonLink href="/messages" variant="outline" className="w-full">
            <MessageCircle aria-hidden className="h-4 w-4" />
            Message {other}
          </ButtonLink>
          {canDispute(order) && (
            <Button variant="ghost" className="w-full text-danger" onClick={() => setDisputeOpen(true)}>
              Report a problem
            </Button>
          )}
        </div>
        {canDispute(order) && (
          <button
            type="button"
            onClick={() => setDisputeOpen(true)}
            className="w-full py-2 text-center text-sm font-semibold text-danger underline-offset-2 hover:underline md:hidden"
          >
            Report a problem
          </button>
        )}
      </div>

      <div className="md:hidden">
        <StickyActionSpacer />
        <StickyActionBar>
          <ButtonLink href="/messages" variant="outline" size="lg" className={primary ? "" : "flex-1"}>
            <MessageCircle aria-hidden className="h-5 w-5" />
            {primary ? <span className="sr-only">Message {other}</span> : `Message ${other}`}
          </ButtonLink>
          {primary}
        </StickyActionBar>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirm you ${doneWord}?`}
        description={`We'll release ${formatNaira(order.amount)} to ${other}. This can't be undone.`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Not yet
            </Button>
            <Button className="flex-1" onClick={confirm} disabled={busy}>
              {busy && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
              Yes, release payment
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          If something is wrong, choose “Report a problem” instead — the money stays held while we help.
        </p>
      </Modal>

      <DisputeSheet
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        orderId={order.id}
        kind={order.kind}
        onSubmitted={() => {
          setOrder((o) => applyDispute(o, new Date().toISOString()));
          toast("Dispute submitted. Your money stays held.", "info");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
