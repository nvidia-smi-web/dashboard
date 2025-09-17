## Custom Elements Guide

This project lets you display a small set of “custom elements” at the top of the home page, before the per-server cards. These elements are fully configured from an environment variable so you can change them without touching the code.

All values under the `NEXT_PUBLIC_` prefix are exposed to the browser; never put secrets in them.

### How it works

- The home page reads `NEXT_PUBLIC_CUSTOM_ELEMENTS` at runtime.
- If it contains a valid JSON array, the UI renders those elements in a responsive row with wrapping.
- Between elements you can insert a manual line break using `breakAfter: true`.

The feature lives in `app/components/customElements.tsx` and the TypeScript type is defined in `app/components/types.tsx` as `CustomElement`.

---

## Supported element types

Each item in `NEXT_PUBLIC_CUSTOM_ELEMENTS` must be one of the shapes below.

### 1) Text

Required fields:
- `type`: string, must be `"text"`
- `content`: string

Optional fields:
- `id`: string (recommended to be unique)
- `breakAfter`: boolean (insert a line break after this element)

Example:
```
{"type":"text","id":"intro","content":"Welcome to the GPU Dashboard","breakAfter":true}
```

### 2) Link

Required fields:
- `type`: string, must be `"link"`
- `href`: string (URL)
- `text`: string (link label)

Optional fields:
- `id`: string
- `target`: string (e.g. `_blank`)
- `rel`: string (e.g. `noopener noreferrer`)
- `download`: boolean (hint to download resource)
- `svgIcon`: string (the SVG path `d` attribute; shown before the text)
- `breakAfter`: boolean

Example:
```
{"type":"link","id":"docs","href":"https://example.com/docs","text":"Documentation","target":"_blank","rel":"noopener noreferrer","svgIcon":"M5 12h14M12 5l7 7-7 7","breakAfter":false}
```

Notes on `svgIcon`:
- Provide only the `d` path string; the component wraps it in a 24×24 inline SVG.
- Keep paths short to avoid oversized environment variables.

### 3) Copyable

Renders a small button that copies a code snippet to the clipboard.

Required fields:
- `type`: string, must be `"copyable"`
- `label`: string (short text placed before the code)
- `code`: string (the content to copy)

Optional fields:
- `id`: string
- `breakAfter`: boolean

Example:
```
{"type":"copyable","id":"curl","label":"Try: ","code":"curl -fsSL https://example.com/install.sh | sh"}
```

Clipboard notes:
- Uses the browser Clipboard API (`navigator.clipboard`), which requires a secure context (HTTPS or `http://localhost`).
- If the permission is denied or the context is not secure, copying will fail silently and a console error may appear in development tools.

---

## Layout and ordering

- Elements are rendered in the order they appear in the array.
- The container is a flex row with wrapping. Use `breakAfter: true` to force the next element to start on a new line.
- `id` is optional but recommended (used as a stable React key when present).

---

## Notes

- Keep your JSON concise to avoid hitting environment variable size limits (especially in containers).
- Since values are public, avoid embedding tokens, secrets, or private URLs in `NEXT_PUBLIC_CUSTOM_ELEMENTS`.

