import WhatsAppForm from '@/components/WhatsAppForm';

export const metadata = {
  title: 'Contact - Echo Santé',
  description: 'Contactez Echo Santé via WhatsApp pour une demande de partenariat, bénévolat ou information.',
};

const fields = [
  { name: 'Nom', label: 'Nom complet', placeholder: 'Votre nom' },
  { name: 'Email', label: 'Email', placeholder: 'contact@exemple.org' },
  { name: 'Sujet', label: 'Sujet', placeholder: 'Demande de partenariat, bénévolat...' },
  { name: 'Message', label: 'Message', placeholder: 'Décrivez votre projet ou votre demande' },
];

export default function ContactPage() {
  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Contact</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Un message, une action. Contactez-nous sur WhatsApp.</h1>
        <p className="text-lg leading-8 text-slate-300">
          Pour une demande de partenariat, une inscription bénévole ou une question sur nos programmes, utilisez le formulaire ci-dessous. Nous répondons rapidement.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
        <div className="card space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Infos essentielles</h2>
            <p className="mt-4 text-slate-300">Nous utilisons WhatsApp pour centraliser vos demandes et accélérer le traitement.</p>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              <strong>Téléphone:</strong> +243 983 474 584
            </p>
            <p>
              <strong>Email:</strong> hello@echosante.org
            </p>
            <p>
              <strong>Adresse:</strong> Kinshasa, RDC
            </p>
          </div>
        </div>
        <WhatsAppForm title="Envoyer un message WhatsApp" fields={fields} buttonText="Ouvrir WhatsApp" />
      </div>
    </section>
  );
}
