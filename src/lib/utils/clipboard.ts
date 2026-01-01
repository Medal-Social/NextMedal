/**
 * Safely copy text to clipboard with fallback support
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first (requires secure context)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or non-secure contexts (HTTP)
    return copyToClipboardFallback(text);
  } catch {
    // If Clipboard API fails, try fallback
    return copyToClipboardFallback(text);
  }
}

/**
 * Fallback method using deprecated execCommand
 * Works in non-secure contexts and older browsers
 */
function copyToClipboardFallback(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make textarea invisible and positioned off-screen
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // Try to copy
    const successful = document.execCommand('copy');
    textArea.remove();

    return successful;
  } catch {
    return false;
  }
}
