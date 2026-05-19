'use client';

import { useForm } from 'react-hook-form';
import { buildContactMessage, buildWhatsAppLink } from '@/utils/whatsapp';

interface ContactFormProps {
  title: string;
  fields: { name: string; label: string; placeholder: string }[];
  buttonText: string;
}

export default function WhatsAppForm({ title, fields, buttonText }: ContactFormProps) {
  const { register, handleSubmit, formState } = useForm<Record<string, string>>();

  const onSubmit = (values: Record<string, string>) => {
    const message = buildContactMessage(values);
    const url = buildWhatsAppLink(message);
    window.open(url, '_blank');
  };

  return (
    <div className="card space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Formulaire</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {fields.map((field) => (
          <label key={field.name} className="grid gap-2 text-sm text-slate-200">
            <span className="font-medium text-white">{field.label}</span>
            <input
              type="text"
              placeholder={field.placeholder}
              {...register(field.name, { required: true })}
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}
