type LockableScreenOrientation =
  ScreenOrientation & {
    lock?: (
      orientation: 'landscape',
    ) => Promise<void>
  }

const overlayId =
  'khytriachok-orientation-overlay'

function isTouchDevice(): boolean {
  return (
    window.matchMedia(
      '(pointer: coarse)',
    ).matches ||
    navigator.maxTouchPoints > 0
  )
}

function createOrientationOverlay(): HTMLDivElement {
  const existing =
    document.getElementById(overlayId)

  if (existing instanceof HTMLDivElement) {
    return existing
  }

  const overlay =
    document.createElement('div')

  overlay.id = overlayId
  overlay.setAttribute(
    'role',
    'status',
  )

  overlay.setAttribute(
    'aria-live',
    'polite',
  )

  overlay.innerHTML = `
    <div class="orientation-card">
      <div
        class="orientation-device"
        aria-hidden="true"
      >
        <div class="orientation-screen">
          <span>🦔</span>
        </div>
      </div>

      <div class="orientation-title">
        Поверніть пристрій
      </div>

      <div class="orientation-message">
        Пригоди Їжачка Хитрячка працюють
        у горизонтальному режимі
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  return overlay
}

function updateOrientationOverlay(): void {
  const overlay =
    createOrientationOverlay()

  const isPortrait =
    window.matchMedia(
      '(orientation: portrait)',
    ).matches

  const shouldShow =
    isTouchDevice() && isPortrait

  overlay.classList.toggle(
    'is-visible',
    shouldShow,
  )

  document.documentElement.classList.toggle(
    'orientation-blocked',
    shouldShow,
  )
}

export async function requestLandscapeOrientation():
  Promise<void> {
  const orientation =
    screen.orientation as
      LockableScreenOrientation

  if (!orientation.lock) {
    return
  }

  try {
    await orientation.lock('landscape')
  } catch {
    /*
     * Safari та деякі браузери не дозволяють
     * програмне блокування орієнтації.
     * У такому разі працює портретна заглушка.
     */
  }
}

export function installOrientationLock(): void {
  createOrientationOverlay()
  updateOrientationOverlay()

  window.addEventListener(
    'resize',
    updateOrientationOverlay,
  )

  window.addEventListener(
    'orientationchange',
    updateOrientationOverlay,
  )

  screen.orientation?.addEventListener?.(
    'change',
    updateOrientationOverlay,
  )

  document.addEventListener(
    'visibilitychange',
    () => {
      if (
        document.visibilityState === 'visible'
      ) {
        updateOrientationOverlay()
      }
    },
  )

  /*
   * На підтримуваних пристроях просимо
   * landscape після першої дії користувача.
   */
  document.addEventListener(
    'pointerdown',
    () => {
      void requestLandscapeOrientation()
    },
    {
      once: true,
      passive: true,
    },
  )
}
