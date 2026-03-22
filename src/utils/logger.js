export function logError(context, error, details = undefined) {
  console.error(`[MuslimOS] ${context}:`, error, details ?? '');
}

export function logWarn(context, message, details = undefined) {
  console.warn(`[MuslimOS] ${context}:`, message, details ?? '');
}

export function logInfo(context, message, details = undefined) {
  console.info(`[MuslimOS] ${context}:`, message, details ?? '');
}
