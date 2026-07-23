"use client";

type UiScrimProps = {
  open: boolean;
  onClose: () => void;
};

/** Assombrissement plein écran (comme les modales Devis/RDV), sous chat / a11y. */
export function UiScrim({ open, onClose }: UiScrimProps) {
  if (!open) return null;
  return (
    <div
      className="ui-scrim is-open"
      role="presentation"
      aria-hidden="true"
      onClick={onClose}
    />
  );
}
