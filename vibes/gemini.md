When creating html/css/js files, always:
- CSS: simplify the style as much as possible
- JS: do not use any framework. Vanilla JS only.
- JS: manipulate DOM by:

```
  // --- Utility ---
  const byId = id  => document.getElementById(id);
  const qs   = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  // debounce wrapper
  function debounce(fn, delay = 100) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  // --- DOM elements ---
  const dom = {
	fooRadios         : qsa("input[name='secret-mode']"),
	foo1Buttons       : byId("random-buttons"),
    foo2Buttons       : qsa("button.generate"),
  };

  // --- Modern clipboard helper with fallback ---
async function copyToClipboard(elementId, trimEdges = false) {
  const el = document.getElementById(elementId);
  let text = el.value ?? '';
  if (trimEdges) {
    text = text.trim(); // trim only edges if requested
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch {
    console.warn("Clipboard write failed");
  }
}
```