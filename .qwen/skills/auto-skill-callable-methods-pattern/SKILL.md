---
name: callable-methods-pattern
description: Create a JS object that is both callable as a function and has methods (e.g., res(200, data) + res.views()). Uses constructor-returning-function with Object.setPrototypeOf.
source: auto-skill
extracted_at: '2026-06-21T12:30:21.707Z'
---

# Callable + Methods Pattern in JavaScript

When designing APIs where an object should be both **callable** (`res(200, data)`) and **method-bearing** (`res.views('file.html')`, `res.status().json(data)`), use this pattern.

## Implementation Template

```js
class MyCallable {
  constructor(/* external deps */) {
    const ctx = { _state: {}, _sent: false, /* ... */ };

    // 1. Create the callable function
    function callable(/* call args */) {
      if (ctx._sent) return callable;  // prevent double action
      // ... do the main action using ctx ...
      ctx._sent = true;
      return callable;  // return self for chaining
    }

    // 2. Attach methods as own properties, each returning callable for chaining
    callable.status = (code) => { ctx._statusCode = code; return callable; };
    callable.json = (data) => { callable(ctx._statusCode, data); return callable; };
    callable.views = (filePath) => { /* use ctx._viewsDir */ return callable; };
    callable.isSent = () => ctx._sent;

    // 3. Set prototype for instanceof compatibility
    Object.setPrototypeOf(callable, MyCallable.prototype);

    // 4. Constructor returns the callable (not `this`)
    return callable;
  }
}
```

## Key Design Decisions

1. **Internal `ctx` object**: Since the callable is a function (not a traditional class instance), all state must be stored in a closure variable (`ctx`), not on `this`. Methods access `ctx` via closure.

2. **`Object.setPrototypeOf(callable, MyCallable.prototype)`**: Without this, `res instanceof MyCallable` returns `false`. With it, `instanceof` works correctly. Trade-off: `typeof res === 'function'` (not `'object'`).

3. **Constructor returns callable**: When `new MyCallable()` returns a non-`this` object (the function), JavaScript uses that returned object instead of the default `this`. This is how `new Response()` gives you a callable.

4. **Double-action prevention**: Use a `_sent` (or `_done`) flag in `ctx` to prevent calling the main action twice. Check at the top of the callable function.

5. **Chaining support**: Methods like `.status()` and `.setHeader()` should return `callable` (the function itself) so `res.status(200).json(data)` works.

6. **`typeof res === 'function'`**: This is inherent to the pattern. The instance IS a function. Accept this trade-off.

## Known Gotchas

- **Node ESM file extensions**: Config files must use `.js` extension (e.g., `piaman.config.js` not `piaman.js.config`). Node ESM only recognizes `.js`, `.mjs`, `.cjs` as importable modules. The `.config` extension causes `ERR_UNKNOWN_FILE_EXTENSION`.
- **Relative import paths in nested dirs**: From `routes/example/`, importing `modules/example/` needs `../../modules` (2 levels up), not `../modules` (1 level up — that resolves to `routes/modules`).
