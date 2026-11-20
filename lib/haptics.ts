"use client";

// Best-effort haptic feedback.
// - Android / Chrome: Vibration API with short patterns.
// - iOS Safari (no Vibration API): toggling a hidden <input type="checkbox" switch>
//   plays the system switch haptic on iOS 18+. One pulse per call.
// - Desktop / unsupported: silently does nothing.

type Pattern = number | number[];

let iosSwitch: HTMLLabelElement | null = null;

function iosPulse() {
  if (typeof document === "undefined") return;
  if (!iosSwitch) {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  iosSwitch.click();
}

function buzz(pattern: Pattern, iosPulses = 1) {
  if (typeof navigator === "undefined") return;
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
      return;
    }
    for (let i = 0; i < iosPulses; i++) setTimeout(iosPulse, i * 120);
  } catch {
    // never let haptics break the UI
  }
}

export const haptics = {
  /** Drag crossed the like/pass threshold. */
  tick: () => buzz(8),
  /** Like recorded. */
  like: () => buzz([12, 40, 18], 2),
  /** Pass recorded. */
  pass: () => buzz(14),
  /** It's a match! */
  match: () => buzz([30, 60, 30, 60, 90], 3),
};
