import { createSignal, onMount, onCleanup } from 'solid-js';
import { getVisibleCaretCoordinates } from '@/lib/caretPosition.js';

export function EditorPane(props) {
  let textareaRef;
  const [caretPos, setCaretPos] = createSignal({ top: 0, left: 0, height: 24, visible: true });
  const [isFocused, setIsFocused] = createSignal(false);

  const updateCaretPosition = () => {
    if (!textareaRef) return;
    const coords = getVisibleCaretCoordinates(textareaRef);
    setCaretPos(coords);
  };

  // Update on any interaction that might move the caret
  const handleInput = (e) => {
    props.onChange(e.currentTarget.value);
    updateCaretPosition();
  };

  const handleSelect = () => updateCaretPosition();
  const handleScroll = () => updateCaretPosition();

  onMount(() => {
    // Also listen to selectionchange for arrow keys, etc.
    const onSelectionChange = () => {
      if (document.activeElement === textareaRef) {
        updateCaretPosition();
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    onCleanup(() => document.removeEventListener('selectionchange', onSelectionChange));
  });

  return (
    <div class="editor-wrapper">
      <textarea
        ref={textareaRef}
        class="editor"
        value={props.value}
        onInput={handleInput}
        onSelect={handleSelect}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Start writing..."
        spellcheck={true}
      />
      <div
        class="custom-caret"
        classList={{ visible: isFocused() && caretPos().visible }}
        style={{
          top: `${caretPos().top}px`,
          left: `${caretPos().left}px`,
          height: `${caretPos().height}px`,
        }}
      />
    </div>
  );
}
