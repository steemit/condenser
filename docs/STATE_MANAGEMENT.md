# State management (Next.js stack)

This document records how Redux state is structured in the refactored app and how it relates to the historical Condenser Redux + Redux-Saga setup (formerly under the removed Webpack tree).

## Architecture decision

- **Redux Toolkit** (`@reduxjs/toolkit`) and **react-redux** are the only Redux-related dependencies in the new stack.
- **Redux-Saga is intentionally not used.** There is no `store/sagas/` directory and legacy `*Saga.js` files are not ported line-for-line.
- **Rationale:** App Router, Route Handlers, and server/client `fetch` cover most former saga-triggered data loading. Remaining side effects are handled with **`createAsyncThunk`** (`store/thunks/*`), direct dispatches from UI, and **`lib/api/*`** helpers.

## Store registration

The root reducer is configured in `store/index.ts` and mounted in `app/layout.tsx` via `store/Provider.tsx`.

Typed hooks live in `store/hooks.ts` (`useAppDispatch`, `useAppSelector`).

## Reducer parity vs legacy `RootReducer.js`

| Legacy combineReducers key | New store key | Implementation |
|----------------------------|---------------|----------------|
| `app` | `app` | `store/slices/appSlice.ts` |
| `global` | `global` | `store/slices/globalSlice.ts` |
| `user` | `user` | `store/slices/userSlice.ts` |
| `search` | `search` | `store/slices/searchSlice.ts` |
| `transaction` | *(removed)* | The transaction flow does not go through Redux: operations are signed client-side (`lib/crypto/transaction-signer.ts`) and broadcast via `lib/api/broadcast.ts` → `app/api/steem/broadcast`. The ported `transactionSlice` had no selectors and no dispatchers before deletion. |
| `offchain` | *(removed)* | No consumers in the new app; session state lives server-side (`lib/auth/session.ts`). |
| `community` | *(removed)* | No consumers; the browser SWR layer (`lib/cache/client-fetch.ts`) is the source of truth for cached community data (the legacy `community` reducer domain inside `globalSlice` remains declared there — deprecated, no dispatchers). |
| `userProfiles` | *(removed)* | No consumers; the browser SWR layer is the source of truth for cached profile data. |
| `ad` | *(removed)* | The Redux copy of the TRON ad lists had no consumers. The rendered lists live in `lib/ads.ts` (static constants consumed by `AdSwipe`: `INDEX_LEFT_SIDE_AD_LIST` / `POST_LEFT_SIDE_AD_LIST` on feed/post right rails, `BOTTOM_AD_LIST` below the post body) — no Redux involvement. |
| `discussion` | *(omitted)* | Legacy was a no-op reducer; nothing in the new app selects it. |
| `routing` | *(omitted)* | Replaced by **Next.js App Router** (no `react-router-redux`). |
| `form` | *(omitted)* | Legacy **redux-form** is not used; use local component state or a dedicated form approach per feature. |

Legacy state used **Immutable.js** (`Map` / `fromJS`). New slices use **plain objects** and Immer via RTK.

## Legacy saga modules (reference only)

These modules existed in historical Condenser (`*Saga.js` under the old Redux tree). They are **not** replicated as TypeScript sagas. The table below is a high-level map of responsibilities to the new stack patterns.

| Legacy module | Responsibility (summary) | New-stack direction |
|---------------|---------------------------|---------------------|
| `AuthSaga.js` | Authority lookup, key-related auth flows | `lib/api/auth`, `store/thunks/authThunks.ts`, login/session UI |
| `UserSaga.js` | User-related side effects | `userSlice` + thunks + `app/api/*` where needed |
| `TransactionSaga.js` | Transaction / broadcast orchestration | No Redux involvement: client-side signing (`lib/crypto/transaction-signer.ts`) + `lib/api/broadcast.ts` → `app/api/steem/broadcast` |
| `FetchDataSaga.js` | Route-driven fetch, communities, tags, followers, notices | Page-level data in **RSC** / **Route Handlers** / `lib/api/steem.ts` |
| `GlobalSaga.js` | Dynamic global properties (e.g. DGP) | Fetch on demand or from API; optional thunk if global cache is required |
| `PollingSaga.js` | Background polling | Not ported; consider intervals in hooks, **RTK Query** polling, or server push if required |
| `FollowSaga.js` | Follow graph loading | `lib/api` + pages/components |
| `CommunitySaga.js`, `CommunitySearchSaga.js` | Community data and search | API routes (`app/api/steem/communities`, `app/api/steem/community-roles`) + browser SWR cache |
| `SearchSaga.js` | Search requests | `app/api/search/route.ts`, `searchSlice` |
| `UserProfilesSaga.js` | Profile hydration | `app/api/steem/profile` + browser SWR cache (no Redux slice) |

## Functional parity and gaps

- **Phase-two closure:** Structural parity for named legacy reducer domains is satisfied by the slices listed above. Five legacy-parity slices that were ported early (`transaction`, `offchain`, `community`, `userProfiles`, `ad`) accumulated no selectors or dispatchers as features landed elsewhere (API routes, thunks, SWR cache) and have been deleted; the table above records where each domain now lives. **Saga-level parity is not a goal** for the new stack unless a future ADR reintroduces orchestration tooling.
- **No-op action policy (what gets deleted vs kept):** a reducer with side effects, or one that only serves an already-dead UI path, is deleted outright (e.g. the announcement toggle with its sessionStorage writes, `transactionSlice`'s error callback). A pure no-op action with no dispatchers (`checkKeyType`, `saveLogin`, `accountAuthLookup`, `steemApiError`) is kept as a documented no-op and left for a later dedicated batch.
- **Verification:** Compare critical user flows (login, vote, post, wallet) against historical Condenser behavior when extending features; extend thunks or server endpoints where state or timing still diverges.

## Optional future work

- **RTK Query:** Add for normalized caching and deduplication if client-side fetching becomes heavy.
- **Redux-Saga (only if needed):** Would require an explicit ADR, new dependency, and a maintenance story; not planned today.
