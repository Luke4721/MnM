import React from 'react';
import { AlertTriangle, ArrowLeft, Lock, Loader2, Printer } from 'lucide-react';
import {
  COMPANY,
  EXCLUSIONS_PLACEHOLDER,
  INCLUSIONS_PLACEHOLDER,
  formatINR,
  formatInvoiceDate,
  type ProvisionalInvoiceData,
} from '../lib/invoice';

interface ProvisionalInvoiceProps {
  invoice: ProvisionalInvoiceData;
  onProceed: () => void;
  onEdit: () => void;
  processing?: boolean;
  errorMessage?: string | null;
  /** Shown when the server is missing Razorpay credentials, or the keys disagree. */
  serverWarning?: string | null;
}

const labelClass = 'text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400';

export const ProvisionalInvoice: React.FC<ProvisionalInvoiceProps> = ({
  invoice,
  onProceed,
  onEdit,
  processing = false,
  errorMessage = null,
  serverWarning = null,
}) => {
  return (
    <div className="space-y-6">
      <article className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl print:border-0 print:shadow-none">
        {/* Masthead */}
        <header className="p-6 md:p-10 border-b border-gray-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <img
              src={COMPANY.logo_url}
              alt={COMPANY.name}
              className="h-14 w-auto object-contain shrink-0"
            />
            <div>
              <h2 className="text-base font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                {COMPANY.name}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {COMPANY.contact.address}
                <br />
                {COMPANY.contact.email} · {COMPANY.contact.phone}
              </p>
            </div>
          </div>

          <div className="md:text-right">
            <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-[#FF9933]">
              Provisional Invoice
            </h3>
            <dl className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300 tabular-nums">
              <div className="flex md:justify-end gap-2">
                <dt className={labelClass}>Invoice no.</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {invoice.invoiceNumber}
                </dd>
              </div>
              <div className="flex md:justify-end gap-2">
                <dt className={labelClass}>Issued</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {formatInvoiceDate(invoice.issuedAt)}
                </dd>
              </div>
              <div className="flex md:justify-end gap-2">
                <dt className={labelClass}>Status</dt>
                <dd className="font-semibold text-amber-600 dark:text-amber-400">
                  Awaiting payment
                </dd>
              </div>
            </dl>
          </div>
        </header>

        {/* Parties */}
        <section className="p-6 md:p-10 border-b border-gray-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className={labelClass}>Billed to</p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {invoice.customerName}
            </p>
          </div>
          <div>
            <p className={labelClass}>Portal / lead source</p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {invoice.leadSource}
            </p>
          </div>
        </section>

        {/* Line items */}
        <section className="p-6 md:p-10 border-b border-gray-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                <th className={`${labelClass} text-left pb-3 w-12`}>Sr.</th>
                <th className={`${labelClass} text-left pb-3`}>Selected services</th>
                <th className={`${labelClass} text-right pb-3`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.services.map((service, index) => (
                <tr
                  key={service}
                  className="border-b border-gray-100 dark:border-zinc-800/60 last:border-0"
                >
                  <td className="py-3 text-gray-400 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 text-gray-800 dark:text-gray-100">{service}</td>
                  <td className="py-3 text-right text-gray-400 text-xs uppercase tracking-wider">
                    Included
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-5 text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Total payable amount
                  </span>
                </td>
                <td className="pt-5 text-right">
                  <span className="text-xl md:text-2xl font-bold text-[#FF9933] tabular-nums">
                    {formatINR(invoice.amount)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Inclusions */}
        <section className="p-6 md:p-10 border-b border-gray-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className={labelClass}>Inclusions</p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {INCLUSIONS_PLACEHOLDER.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#FF9933] shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={labelClass}>Not included</p>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {EXCLUSIONS_PLACEHOLDER.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gray-300 dark:text-zinc-600 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Notes + terms */}
        <footer className="p-6 md:p-10 space-y-4">
          {invoice.notes && (
            <div>
              <p className={labelClass}>Notes</p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed">
            This is a provisional invoice issued for payment collection and is not a tax invoice.
            A final tax invoice will be issued on receipt of payment. Amounts are quoted in Indian
            Rupees (INR).
          </p>
        </footer>
      </article>

      {serverWarning && (
        <div className="flex items-start gap-3 border border-amber-300/60 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-4 text-xs text-amber-800 dark:text-amber-300 print:hidden">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{serverWarning}</p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-300/60 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 p-4 text-xs text-red-700 dark:text-red-300 print:hidden"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <button
          type="button"
          onClick={onEdit}
          disabled={processing}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-semibold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-[#FF9933] hover:text-[#FF9933] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft size={14} /> Edit details
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-semibold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-[#FF9933] hover:text-[#FF9933] transition-all cursor-pointer"
        >
          <Printer size={14} /> Print / Save PDF
        </button>
        <button
          type="button"
          onClick={onProceed}
          disabled={processing}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF9933] hover:bg-[#D00030] text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {processing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Opening checkout…
            </>
          ) : (
            <>
              <Lock size={16} /> Proceed to Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};
