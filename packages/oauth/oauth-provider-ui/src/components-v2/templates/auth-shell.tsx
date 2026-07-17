import type { ReactNode } from 'react'
import { useCustomizationData } from '#/contexts/customization.tsx'
import { AsciiGlobe } from '../atoms/ascii-globe.tsx'
import { FooterLink } from '../atoms/footer-link.tsx'
import { LocaleSelector } from '../atoms/locale-selector.tsx'

/**
 * Persistent outer shell for the pre-auth flow (welcome, sign-in, sign-up,
 * consent, redirecting) — owns the page background, decorative globe, and
 * footer. These screens are swapped in and out by `AuthenticationProvider` /
 * `App()` as the user moves between steps; mounting this shell once at that
 * level (rather than per-screen, which is what `AuthCard` used to do) keeps
 * the globe's WebGL context and rotation alive across step transitions
 * instead of resetting every time the screen changes. `AuthCard` itself now
 * renders only the floating card, meant to be used as this shell's child.
 */
export function AuthShell({ children }: { children?: ReactNode }) {
  const { links } = useCustomizationData()

  return (
    <div className="bg-surface-0 flex min-h-dvh w-full flex-col">
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-stretch overflow-y-auto px-5 py-10 sm:flex-row sm:items-center sm:justify-center">
        {/* Decorative — reinforces the at:// identity, doesn't carry content.
            The globe itself opts back into pointer events (drag to spin);
            this wrapper stays inert everywhere else. */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center sm:flex">
          <AsciiGlobe
            lines={36}
            // Fixed decorative gold palette in both light and dark — a
            // deliberate constant, not the operator's brand hue, so it's exempt
            // from the "brand color only on buttons/links/nav" rule.
            className="text-[10px] text-yellow-500/40 sm:text-sm md:text-base lg:text-lg"
          />
        </div>

        {children}
      </div>

      <footer className="border-surface-border w-full flex-none border-t px-6 py-3 sm:flex sm:h-14 sm:items-center sm:py-0">
        <div className="flex w-full flex-col items-center gap-3 text-xs sm:flex-row sm:flex-wrap sm:justify-between sm:gap-4">
          <LocaleSelector className="text-sm" />
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {links?.map((link) => (
              <FooterLink
                key={link.href}
                link={link}
                className="text-ink-light font-mono text-xs uppercase tracking-wide hover:underline focus:underline focus:outline-none"
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
