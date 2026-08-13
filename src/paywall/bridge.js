export const paywallBridge = {
  purchase(productId) {
    window.dispatchEvent(new CustomEvent('paywall:purchase-start', { detail: { productId } }))
    const native = window.webkit?.messageHandlers?.paywall
    if (native) {
      native.postMessage({ type: 'purchase', productId })
      return
    }
    window.setTimeout(() => window.handlePaywallMessage?.({ type: 'purchaseResult', success: true, productId, entitlement: 'pro' }), 850)
  },
  restore() {
    const native = window.webkit?.messageHandlers?.paywall
    if (native) native.postMessage({ type: 'restorePurchases' })
    else window.setTimeout(() => window.handlePaywallMessage?.({ type: 'restoreResult', success: false }), 700)
  },
  close() {
    const native = window.webkit?.messageHandlers?.paywall
    if (native) native.postMessage({ type: 'closePaywall' })
    else window.history.back()
  },
}

