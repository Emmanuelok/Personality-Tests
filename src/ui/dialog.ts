import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Keeps keyboard focus inside a modal surface, closes it with Escape, and
 * restores focus to the control that opened it.
 */
export function useDialogFocusTrap<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
): RefObject<T> {
  const dialogRef = useRef<T>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusFirst = () => {
      const first = dialog.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialog).focus({ preventScroll: true });
    };
    const frame = window.requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      window.requestAnimationFrame(() => returnFocusRef.current?.focus({ preventScroll: true }));
    };
  }, [open, onClose]);

  return dialogRef;
}
