"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { QuoteForm } from "@/components/QuoteForm";

type ModalType = "rdv" | "devis" | null;

type ModalContextValue = {
  open: (type: Exclude<ModalType, null>, formulaId?: string) => void;
  close: () => void;
  formulaId?: string;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ModalType>(null);
  const [formulaId, setFormulaId] = useState<string | undefined>();

  const open = useCallback((next: Exclude<ModalType, null>, id?: string) => {
    setFormulaId(id);
    setType(next);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setType(null);
    setFormulaId(undefined);
    document.body.style.overflow = "";
  }, []);

  const value = useMemo(
    () => ({ open, close, formulaId }),
    [open, close, formulaId],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {type ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(15,47,38,0.55)] p-0 sm:items-center sm:p-6"
          role="presentation"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-[var(--paper)] p-6 shadow-[var(--shadow)] sm:rounded-3xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Meridian</p>
                <h2 id="modal-title" className="display mt-2 text-3xl text-[var(--ink)]">
                  {type === "rdv" ? "Prendre rendez-vous" : "Demander un devis"}
                </h2>
                <p className="mt-2 text-[var(--ink-soft)]">
                  {type === "rdv"
                    ? "Choisissez un créneau. Nous confirmons sous 24 h ouvrées."
                    : "Décrivez votre besoin. Réponse sous 48 h ouvrées."}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary !min-h-10 !px-3"
                onClick={close}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            {type === "rdv" ? <AppointmentForm /> : <QuoteForm formulaId={formulaId} />}
          </div>
        </div>
      ) : null}
    </ModalContext.Provider>
  );
}
