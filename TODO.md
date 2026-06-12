# TODO

- [x] Update `app/api/community/upload/route.ts` to:
  - [x] Normalize response to always include a usable `url`
  - [x] Improve logging so we know whether Vercel Blob failed or local fallback failed
  - [x] Ensure correct data type is passed to `@vercel/blob` (use Buffer from arrayBuffer)
- [x] Re-run upload call manually / tests to verify HTTP 200 from `/api/community/upload` and that response JSON includes `url`
- [x] Add “Your Name (credits)” field to community post modal and send as `username` so posts get credited to user instead of always Guest Driver
