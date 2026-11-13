// Capture CSS pixels at page access time; never treat a narrow window as a phone.
export function collectVisitContext(win = window, nav = navigator) {
  return {
    viewport: { width: win.innerWidth, height: win.innerHeight },
    screen: { width: win.screen?.width, height: win.screen?.height },
    devicePixelRatio: win.devicePixelRatio,
    maxTouchPoints: nav.maxTouchPoints
  };
}
