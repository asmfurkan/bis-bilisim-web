import { MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/contact";

export default function WhatsAppButton() {
  return (
    <a
      href={CONTACT.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile İletişime Geçiniz"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/50 sm:w-auto sm:justify-start sm:px-5"
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/50" />
      <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.25} />
      <span className="hidden text-sm font-semibold whitespace-nowrap sm:inline">
        WhatsApp ile İletişime Geçiniz
      </span>
      <span className="sr-only sm:hidden">WhatsApp ile İletişime Geçiniz</span>
    </a>
  );
}
