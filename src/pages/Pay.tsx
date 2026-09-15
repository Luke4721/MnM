import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Receipt, ShieldCheck } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { PaymentForm } from '../components/PaymentForm';
import { ProvisionalInvoice } from '../components/ProvisionalInvoice';
import {
  COMPANY,
  formatINR,
  generateInvoiceNumber,
  type InvoiceDraft,
  type ProvisionalInvoiceData,
} from '../lib/invoice';
import {
  PUBLIC_KEY_ID,
  PaymentDismissedError,
  createOrder,
  describeClientMismatch,
  fetchServerConfig,
  openRazorpayCheckout,
  verifyPayment,
  type RazorpayPaymentResult,
  type RazorpayServerConfig,
} from '../lib/razorpay';

type Stage = 'form' | 'invoice' | 'paid';

export const Pay: React.FC = () => {
  const [stage, setStage] = useState<Stage>('form');
  const [draft, setDraft] = useState<InvoiceDraft | null>(null);
  const [invoice, setInvoice] = useState<ProvisionalInvoiceData | null>(null);
  const [payment, setPayment] = useState<RazorpayPaymentResult | null>(null);
  const [serverConfig, setServerConfig] = useState<RazorpayServerConfig | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  useEffect(() => {
    let active = true;
    fetchServerConfig().then((config) => {
      if (active) setServerConfig(config);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = (nextDraft: InvoiceDraft) => {
    setDraft(nextDraft);
    setInvoice({
      ...nextDraft,
      invoiceNumber: generateInvoiceNumber(),
      issuedAt: new Date().toISOString(),
    });
    setErrorMessage(null);
    setStage('invoice');
  };

  /** Server-side signature check — an unverified callback is never treated as paid. */
  const finalizePayment = async (result: RazorpayPaymentResult, orderId: string) => {
    if (!result.signature) {
      setErrorMessage(
        'Razorpay returned no signature, so the payment cannot be verified. Check the Razorpay dashboard before releasing the booking.',
      );
      return;
    }

    const verification = await verifyPayment({
      orderId: result.orderId ?? orderId,
      paymentId: result.paymentId,
      signature: result.signature,
    });

    if (!verification.verified) {
      setErrorMessage(
        verification.error ??
          'The payment signature did not verify. Do not release the booking until this is checked.',
      );
      return;
    }

    setPayment(result);
    setErrorMessage(null);
    setStage('paid');
  };

  const handleProceed = async () => {
    if (!invoice) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const order = await createOrder({
        amountInRupees: invoice.amount,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        leadSource: invoice.leadSource,
        services: invoice.services,
        notes: invoice.notes,
      });

      const keyId = order.keyId ?? PUBLIC_KEY_ID;
      if (!keyId) {
        throw new Error(
          'No Razorpay key ID available. Set VITE_RAZORPAY_KEY_ID (client) and RAZORPAY_KEY_ID (server).',
        );
      }

      const mismatch = describeClientMismatch(order.keyId);
      if (mismatch) throw new Error(mismatch);

      const result = await openRazorpayCheckout(
        {
          keyId,
          orderId: order.orderId,
          currency: order.currency,
          customerName: invoice.customerName,
          invoiceNumber: invoice.invoiceNumber,
          leadSource: invoice.leadSource,
          services: invoice.services,
          notes: invoice.notes,
        },
        {
          // A payment confirmed after we stopped waiting for the modal still counts.
          onLateSuccess: (lateResult) => {
            void finalizePayment(lateResult, order.orderId).catch((error: unknown) => {
              setErrorMessage(
                error instanceof Error ? error.message : 'Could not verify the late payment.',
              );
            });
          },
        },
      );

      await finalizePayment(result, order.orderId);
    } catch (error) {
      if (error instanceof PaymentDismissedError) {
        setErrorMessage('Checkout was closed before the payment was completed. You can retry.');
      } else {
        setErrorMessage(
          error instanceof Error ? error.message : 'The payment could not be completed.',
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const startOver = () => {
    setDraft(null);
    setInvoice(null);
    setPayment(null);
    setErrorMessage(null);
    setStage('form');
  };

  const configWarning =
    serverConfig && !serverConfig.configured
      ? `Razorpay is not configured on the server yet. Set ${serverConfig.missing.join(' and ')} in .env.local (and in your Vercel project) before collecting payment.`
      : null;

  return (
    <PageTransition>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-black transition-colors duration-500 px-4 py-8 md:py-14">
        <div className="mx-auto w-full max-w-4xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 hover:border-[#FF9933] hover:text-[#FF9933] transition-all no-underline"
            >
              <ArrowLeft size={14} /> Home
            </Link>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-800">
              <Receipt size={12} /> Internal
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8 print:hidden">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Executive Payment Desk
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              Raise a provisional invoice for {COMPANY.name} and collect payment by card, UPI, net
              banking or wallet. Unlisted page — share the link only with the team.
            </p>
            {serverConfig?.testMode && (
              <p className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
                Test mode · rzp_test_ key
              </p>
            )}
          </div>

          {stage === 'form' && <PaymentForm onSubmit={handleGenerate} initialDraft={draft} />}

          {stage === 'invoice' && invoice && (
            <ProvisionalInvoice
              invoice={invoice}
              onProceed={handleProceed}
              onEdit={() => setStage('form')}
              processing={processing}
              errorMessage={errorMessage}
              serverWarning={configWarning}
            />
          )}

          {stage === 'paid' && invoice && payment && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-8 md:p-12 text-center">
              <CheckCircle2 size={48} className="mx-auto text-green-500" />
              <h2 className="mt-6 text-2xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Payment received
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formatINR(invoice.amount)} collected from {invoice.customerName}.
              </p>

              <dl className="mt-8 mx-auto max-w-md divide-y divide-gray-200 dark:divide-zinc-800 border-y border-gray-200 dark:border-zinc-800 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-gray-500 dark:text-gray-400">Invoice no.</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white tabular-nums">
                    {invoice.invoiceNumber}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-gray-500 dark:text-gray-400">Razorpay payment ID</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white break-all">
                    {payment.paymentId}
                  </dd>
                </div>
                {payment.orderId && (
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-gray-500 dark:text-gray-400">Razorpay order ID</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white break-all">
                      {payment.orderId}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-gray-500 dark:text-gray-400">Portal / source</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {invoice.leadSource}
                  </dd>
                </div>
              </dl>

              <p className="mt-8 inline-flex items-start gap-2 text-left text-xs text-green-700 dark:text-green-400">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                Signature verified server-side against your Razorpay key secret.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
                <button
                  type="button"
                  onClick={startOver}
                  className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-[#FF9933] hover:text-[#FF9933] transition-all cursor-pointer"
                >
                  Create another invoice
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-semibold uppercase tracking-widest bg-[#FF9933] hover:bg-[#D00030] text-white transition-colors no-underline"
                >
                  <ArrowLeft size={14} /> Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
