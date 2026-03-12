const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
const defaultMessage = 'Hola! Quiero consultar por sus productos.';
const message = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || defaultMessage;

function buildWhatsAppUrl(rawPhone: string, rawMessage: string) {
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const text = encodeURIComponent(rawMessage);
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export function WhatsAppButton() {
  if (!phone) return null;

  const href = buildWhatsAppUrl(phone, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:brightness-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M19.11 17.38c-.27-.13-1.57-.77-1.81-.86-.24-.09-.42-.13-.6.14-.18.27-.69.86-.85 1.03-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.33-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.21 0 1.3.95 2.55 1.08 2.73.13.18 1.86 2.85 4.5 3.99.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.57-.64 1.79-1.26.22-.62.22-1.16.16-1.26-.07-.11-.24-.18-.51-.31z" />
        <path d="M16.03 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.25.59 4.46 1.7 6.41L3.2 28.8l6.56-1.7a12.75 12.75 0 0 0 6.27 1.69h.01c7.07 0 12.8-5.73 12.8-12.8S23.1 3.2 16.03 3.2zm0 23.35h-.01a10.5 10.5 0 0 1-5.36-1.47l-.38-.22-3.89 1.01 1.04-3.79-.25-.39a10.52 10.52 0 1 1 8.85 4.86z" />
      </svg>
    </a>
  );
}