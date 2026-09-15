import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import {
  LEAD_SOURCE_GROUPS,
  OTHER_LEAD_SOURCE,
  SERVICE_CATALOG,
  formatINR,
  type InvoiceDraft,
} from '../lib/invoice';

interface PaymentFormProps {
  onSubmit: (draft: InvoiceDraft) => void;
  initialDraft?: ProvisionalDraftSeed | null;
}

type ProvisionalDraftSeed = Partial<InvoiceDraft>;

type FieldErrors = Partial<Record<'leadSource' | 'customerName' | 'services' | 'amount', string>>;

const CATALOG = SERVICE_CATALOG as readonly string[];

const inputClass =
  'w-full bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all';

const labelClass =
  'block text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2';

const isKnownLeadSource = (value: string): boolean =>
  LEAD_SOURCE_GROUPS.some((group) => (group.options as readonly string[]).includes(value));

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, initialDraft }) => {
  const seed = initialDraft ?? {};

  const [leadSource, setLeadSource] = useState<string>(() => {
    const value = seed.leadSource ?? '';
    if (!value) return '';
    return isKnownLeadSource(value) ? value : OTHER_LEAD_SOURCE;
  });
  const [customLeadSource, setCustomLeadSource] = useState<string>(() => {
    const value = seed.leadSource ?? '';
    return value && !isKnownLeadSource(value) ? value : '';
  });
  const [customerName, setCustomerName] = useState(seed.customerName ?? '');
  const [services, setServices] = useState<string[]>(seed.services ?? []);
  const [customService, setCustomService] = useState('');
  const [amount, setAmount] = useState(seed.amount ? String(seed.amount) : '');
  const [notes, setNotes] = useState(seed.notes ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});

  const toggleService = (service: string) => {
    setServices((previous) =>
      previous.includes(service)
        ? previous.filter((item) => item !== service)
        : [...previous, service],
    );
  };

  const addCustomService = () => {
    const value = customService.trim();
    if (!value) return;
    setServices((previous) => (previous.includes(value) ? previous : [...previous, value]));
    setCustomService('');
  };

  const customServices = services.filter((service) => !CATALOG.includes(service));
  const parsedAmount = Number(amount);
  const amountIsValid = amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const trimmedName = customerName.trim();
    const resolvedSource =
      leadSource === OTHER_LEAD_SOURCE ? customLeadSource.trim() : leadSource.trim();

    if (!resolvedSource) {
      nextErrors.leadSource =
        leadSource === OTHER_LEAD_SOURCE
          ? 'Please specify the portal or source.'
          : 'Select a portal or lead source.';
    }
    if (!trimmedName) nextErrors.customerName = 'Customer name is required.';
    if (services.length === 0) nextErrors.services = 'Select at least one service.';
    if (!amountIsValid) nextErrors.amount = 'Enter an amount greater than zero.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      leadSource: resolvedSource,
      customerName: trimmedName,
      services,
      amount: Math.round(parsedAmount * 100) / 100,
      notes: notes.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white/90 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl p-6 md:p-10"
    >
      <div className="flex items-center gap-3 mb-8">
        <Sparkles size={18} className="text-[#FF9933]" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 dark:text-white">
          Invoice Details
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal / Lead source */}
        <div>
          <label htmlFor="leadSource" className={labelClass}>
            01 · Portal / Lead source
          </label>
          <select
            id="leadSource"
            name="leadSource"
            value={leadSource}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setLeadSource(event.target.value)}
            aria-invalid={Boolean(errors.leadSource)}
            aria-describedby={errors.leadSource ? 'leadSource-error' : undefined}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select source…</option>
            {LEAD_SOURCE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER_LEAD_SOURCE}>{OTHER_LEAD_SOURCE}</option>
          </select>
          {leadSource === OTHER_LEAD_SOURCE && (
            <input
              type="text"
              value={customLeadSource}
              onChange={(event) => setCustomLeadSource(event.target.value)}
              placeholder="Enter portal or source"
              aria-label="Custom portal or source"
              className={`${inputClass} mt-3`}
            />
          )}
          {errors.leadSource && (
            <p id="leadSource-error" className="mt-1.5 text-xs text-red-500">
              {errors.leadSource}
            </p>
          )}
        </div>

        {/* Customer name */}
        <div>
          <label htmlFor="customerName" className={labelClass}>
            02 · Customer name
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Full name as per booking"
            autoComplete="name"
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={errors.customerName ? 'customerName-error' : undefined}
            className={inputClass}
          />
          {errors.customerName && (
            <p id="customerName-error" className="mt-1.5 text-xs text-red-500">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Services */}
        <div className="md:col-span-2">
          <span className={labelClass}>03 · Services selected</span>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATALOG.map((service) => {
              const active = services.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF9933] border-[#FF9933] text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-[#FF9933] hover:text-[#FF9933]'
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <input
              type="text"
              value={customService}
              onChange={(event) => setCustomService(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCustomService();
                }
              }}
              placeholder="Add a custom line item (e.g. Kedarnath helicopter charter)"
              aria-label="Add a custom service"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addCustomService}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:border-[#FF9933] hover:text-[#FF9933] transition-all cursor-pointer"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {customServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customServices.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-full bg-[#FF9933]/10 text-[#B35309] dark:text-[#FFB266] border border-[#FF9933]/30"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => toggleService(service)}
                    aria-label={`Remove ${service}`}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {errors.services && <p className="mt-1.5 text-xs text-red-500">{errors.services}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className={labelClass}>
            04 · Amount payable
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              className={`${inputClass} pl-9 tabular-nums`}
            />
          </div>
          {errors.amount && (
            <p id="amount-error" className="mt-1.5 text-xs text-red-500">
              {errors.amount}
            </p>
          )}
          {!errors.amount && amountIsValid && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              Payable: <span className="font-semibold">{formatINR(parsedAmount)}</span>
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className={labelClass}>
            05 · Additional notes <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Travel dates, pax count, special requests…"
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 w-full bg-[#FF9933] hover:bg-[#D00030] text-white py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-lg"
      >
        Generate Invoice
      </button>
    </form>
  );
};
