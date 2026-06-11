import { Check, QrCode, RotateCcw, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThankYouMessageProps = {
  title?: ReactNode;
  description?: ReactNode;
  mode?: "qr" | "device";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function ThankYouMessage({
  title = "Gracias por compartir tu opinion",
  description = "Tu feedback nos ayuda a brindar mejores experiencias cada dia.",
  mode = "qr",
  actionLabel = "Nueva encuesta",
  onAction,
  className,
}: ThankYouMessageProps) {
  const isDevice = mode === "device";

  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center rounded-2xl bg-white px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-teal-100 text-teal-800 ring-8 ring-teal-50">
        <Check className="size-10" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold leading-tight text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-8 w-full rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-left">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
            {isDevice ? <Smartphone className="size-5" /> : <QrCode className="size-5" />}
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              {isDevice ? "Modo dispositivo" : "Modo QR"}
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {isDevice
                ? "Esta pantalla se cerrara automaticamente en unos segundos."
                : "Puedes cerrar esta pestana. Tu respuesta ya fue registrada."}
            </p>
          </div>
        </div>
      </div>
      {onAction && (
        <Button
          type="button"
          variant="outline"
          className="mt-8 h-11 w-full border-teal-700 text-teal-800 hover:bg-teal-50"
          onClick={onAction}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {actionLabel}
        </Button>
      )}
    </section>
  );
}
