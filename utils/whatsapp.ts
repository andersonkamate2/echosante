export const WHATSAPP_NUMBER = '243983474584';

export function buildWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function buildContactMessage(values: Record<string, string>) {
  const lines = Object.entries(values).map(([key, value]) => `${key}: ${value}`);
  return `Demande Echo Santé\n${lines.join('\n')}`;
}
