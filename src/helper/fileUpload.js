/**
 * File upload helpers: preview URLs and optional base64 conversion.
 * Works for single or multiple files. Plain JS with JSDoc types.
 */

/**
 * Convert a File to base64 data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    try {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result || ''))
      fr.onerror = () => reject(fr.error || new Error('Failed to read file'))
      fr.readAsDataURL(file)
    } catch (err) {
      reject(err)
    }
  })

/**
 * Revoke an array of object URLs created via URL.createObjectURL.
 * Safe to call with empty/invalid inputs.
 * @param {string[]|undefined|null} urls
 */
export const revokeObjectURLs = (urls) => {
  if (!Array.isArray(urls)) return
  for (const u of urls) {
    try {
      if (u) URL.revokeObjectURL(u)
    } catch (_) {
      // ignore
    }
  }
}

/**
 * Handle input[type="file"] change for single or multiple files.
 * - Creates preview URLs immediately for UI.
 * - Optionally returns base64 via setBase64.
 * - Cleans up previous object URLs to avoid memory leaks.
 *
 * @param {React.ChangeEvent<HTMLInputElement>|Event} e
 * @param {{
 *   multiple?: boolean,
 *   acceptBase64?: boolean,
 *   setUrls: (urls: string[]) => void,
 *   setBase64?: (b64: string[]|null) => void,
 *   onError?: (err: unknown) => void,
 *   previousUrls?: string[],
 * }} opts
 */
export const onFilesChange = (e, opts) => {
  const {
    multiple = true,
    acceptBase64 = true,
    setUrls,
    setBase64,
    onError,
    previousUrls = [],
  } = opts || {}

  const input = /** @type {HTMLInputElement|null} */ (e && (e.currentTarget || e.target))
  const filesList = input && input.files

  // If cleared or no files selected
  if (!filesList || filesList.length === 0) {
    // cleanup old previews if any and reset states
    revokeObjectURLs(previousUrls)
    try {
      setUrls([])
      if (setBase64) setBase64(null)
    } catch (_) {
      // ignore
    }
    return
  }

  // 1) Cleanup previous object URLs
  revokeObjectURLs(previousUrls)

  // 2) Collect files (single or multiple)
  const files = Array.from(filesList).slice(0, multiple ? filesList.length : 1)

  // 3) Create preview URLs immediately
  const urls = files.map((f) => URL.createObjectURL(f))
  setUrls(urls)

  // 4) Optional: base64 conversion
  if (acceptBase64 && typeof setBase64 === 'function') {
    Promise.all(files.map(fileToBase64))
      .then((b64s) => setBase64(b64s))
      .catch((err) => {
        try {
          setBase64(null)
        } catch (_) {
          // ignore
        }
        if (typeof onError === 'function') onError(err)
      })
  }
}

export default {
  fileToBase64,
  revokeObjectURLs,
  onFilesChange,
}
