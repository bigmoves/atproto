import { InfoIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import type { OAuthClientMetadata } from '@atproto/oauth-types'

export type ClientImageProps = {
  clientId: string
  clientMetadata: OAuthClientMetadata
  clientTrusted: boolean
}

// Tried in order against the client's own origin. There's no reliable way to
// read a site's declared <link rel="icon"> cross-origin (that requires
// fetching the HTML, which CORS blocks), so this is a best-effort guess at
// common conventions — sites that only serve a custom-hashed icon path won't
// match, and fall through to the generic badge below.
const FAVICON_PATHS = ['/favicon.ico', '/favicon.png', '/favicon.svg']

/**
 * v2 restyle of `#/components/utils/client-image.tsx` — adds a fallback to
 * the client's own domain favicon (fetched from its origin, the same origin
 * the user is about to authorize) between the trusted logo and the generic
 * info-icon badge.
 */
export function ClientImage({
  clientId,
  clientMetadata,
  clientTrusted,
}: ClientImageProps) {
  const logoSrc = clientTrusted ? clientMetadata.logo_uri : undefined
  const alt = clientMetadata.client_name || clientId

  const faviconSrcs = useMemo(() => {
    try {
      const origin = new URL(clientId).origin
      return FAVICON_PATHS.map((path) => `${origin}${path}`)
    } catch {
      return []
    }
  }, [clientId])

  const [logoErrored, setLogoErrored] = useState(false)
  const [faviconIdx, setFaviconIdx] = useState(0)

  useEffect(() => {
    setLogoErrored(false)
  }, [logoSrc])

  useEffect(() => {
    setFaviconIdx(0)
  }, [faviconSrcs])

  if (logoSrc && !logoErrored) {
    return (
      <img
        aria-hidden
        src={logoSrc}
        alt={alt}
        className="-ml-1 size-8"
        onError={() => setLogoErrored(true)}
      />
    )
  }

  const faviconSrc = faviconSrcs[faviconIdx]
  if (faviconSrc) {
    return (
      <img
        key={faviconSrc}
        aria-hidden
        src={faviconSrc}
        alt={alt}
        className="rounded-control size-8 object-cover"
        onError={() => setFaviconIdx((i) => i + 1)}
      />
    )
  }

  return (
    <div
      aria-hidden
      className="bg-surface-2 text-ink-light rounded-control flex size-8 items-center justify-center overflow-hidden"
    >
      <InfoIcon className="size-4" />
    </div>
  )
}
