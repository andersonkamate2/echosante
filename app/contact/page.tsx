import WhatsAppForm from '@/components/WhatsAppForm';
import { getPageContentBySlug, getSiteSetting } from '@/lib/data/public';

export const metadata = {
  title: 'Contact - Echo Santé',
  description: 'Contactez Echo Santé via WhatsApp pour une demande de partenariat, bénévolat ou information.',
};

export const revalidate = 60;

const fields = [
  { name: 'Nom', label: 'Nom complet', placeholder: 'Votre nom' },
  { name: 'Email', label: 'Email', placeholder: 'contact@exemple.org' },
  { name: 'Sujet', label: 'Sujet', placeholder: 'Demande de partenariat, bénévolat...' },
  { name: 'Message', label: 'Message', placeholder: 'Décrivez votre projet ou votre demande' },
];

export default async function ContactPage() {
  const page = await getPageContentBySlug('contact');
  const phoneSetting = await getSiteSetting('contact_phone');
  const emailSetting = await getSiteSetting('contact_email');
  const addressSetting = await getSiteSetting('contact_address');
  const buttonSetting = await getSiteSetting('whatsapp_label');

  const phone = phoneSetting?.value ?? '+243 983 474 584';
  const email = emailSetting?.value ?? 'hello@echosante.org';
  const address = addressSetting?.value ?? 'Kinshasa, RDC';
  const buttonText = buttonSetting?.value ?? 'Envoyer un message WhatsApp';

  return (
    <section className="space-y-12 py-8 sm:py-12">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{page?.title ?? 'Contact'}</p>
        <h1 className="text-5xl font-semibold text-white sm:text-6xl">Un message, une action. Contactez-nous sur WhatsApp.</h1>
        <div className="text-lg leading-8 text-slate-300">
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p>Pour une demande de partenariat, une inscription bénévole ou une question sur nos programmes, utilisez le formulaire ci-dessous.</p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
        <div className="card space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Infos essentielles</h2>
            <p className="mt-4 text-slate-300">Nous utilisons WhatsApp pour centraliser vos demandes et accélérer le traitement.</p>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              <strong>Téléphone:</strong> {phone}
            </p>
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Adresse:</strong> {address}
            </p>
          </div>
        </div>
        <WhatsAppForm title="Envoyer un message WhatsApp" fields={fields} buttonText={buttonText} />
      </div>
    </section>
  );
}
