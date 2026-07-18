const DEBOUNCE_DELAY = 2000

let timeoutId: ReturnType<typeof setTimeout> | undefined

const scheduleSaveDocument = (document: { save: () => void }) => {
  if (timeoutId !== undefined) clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    timeoutId = undefined
    document.save()
  }, DEBOUNCE_DELAY)
}

export default scheduleSaveDocument
