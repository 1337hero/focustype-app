/**
 * Calculate pixel coordinates of the caret in a textarea.
 * Modernized from textarea-caret-position (MIT License).
 *
 * Uses a mirror div technique: creates an invisible div with identical
 * styling to the textarea, copies text up to caret position, then
 * measures where a marker span lands.
 */

// Properties to copy from textarea to mirror div for accurate measurement.
// Excludes height/overflow - mirror must expand freely without affecting layout.
const MIRROR_PROPERTIES = [
  'direction',
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
];

// Reuse a single mirror div for performance.
// Positioned off-screen with fixed positioning to avoid affecting page layout.
let mirrorDiv = null;

function getMirrorDiv() {
  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    Object.assign(mirrorDiv.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflow: 'hidden',
    });
    document.body.appendChild(mirrorDiv);
  }
  return mirrorDiv;
}

/**
 * Get caret coordinates relative to the textarea element.
 * @param {HTMLTextAreaElement} textarea
 * @param {number} position - Character index (defaults to selectionStart)
 * @returns {{ top: number, left: number, height: number }}
 */
export function getCaretCoordinates(textarea, position = textarea.selectionStart) {
  const div = getMirrorDiv();
  const computed = getComputedStyle(textarea);

  // Copy relevant styles to mirror
  for (const prop of MIRROR_PROPERTIES) {
    div.style[prop] = computed[prop];
  }

  // Fill with text up to caret position
  div.textContent = textarea.value.substring(0, position);

  // Add marker span for measurement
  const marker = document.createElement('span');
  marker.textContent = textarea.value.substring(position) || '.';
  div.appendChild(marker);

  const coords = {
    top: marker.offsetTop + parseInt(computed.borderTopWidth, 10),
    left: marker.offsetLeft + parseInt(computed.borderLeftWidth, 10),
    height: parseInt(computed.lineHeight, 10) || parseInt(computed.fontSize, 10),
  };

  // Clean up marker (keep mirror div for reuse)
  div.textContent = '';

  return coords;
}

/**
 * Get caret coordinates adjusted for textarea scroll position.
 * Returns coordinates relative to the textarea's visible area.
 * @param {HTMLTextAreaElement} textarea
 * @param {number} position
 * @returns {{ top: number, left: number, height: number, visible: boolean }}
 */
export function getVisibleCaretCoordinates(textarea, position = textarea.selectionStart) {
  const coords = getCaretCoordinates(textarea, position);

  // Adjust for scroll
  const top = coords.top - textarea.scrollTop;
  const left = coords.left - textarea.scrollLeft;

  // Check if caret is in visible area
  const visible = top >= 0 && top <= textarea.clientHeight;

  return { top, left, height: coords.height, visible };
}
