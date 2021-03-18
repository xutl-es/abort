# @xutl/abort

One [eXtremely Useful Tool Library](https://xutl.es) to facilitate using AbortController patterns work with async constructs.

## Install

```bash
npm install --save-dev @xutl/abort
```

## Usage

```typescript
import AbortController from '@xutl/abort';

const abortController = new AbortController();

const abortablePromise = abortController.abortable(promise);

abortable.api(arg, { signal: abortController.signal }); // use with standard AbortSignal pattern

await abortController.abort(); // aborts connected things immediately
await abortController.timeout(5000); // aborts connected things after 5 seconds
```

## Rationale

This allows you to create an API that can do asynchronous cleanup by returning a `Promise` from the `on('abort', handler)` handler.
And because it is meant to be kind to asynchronous operation the `abort()` call will only resolve once all async cleanup is complete.

## License

Copyright 2019,2020 xutl.es

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
