# State management (Next.js stack)

This document records how Redux state is structured in the refactored app and how it relates to the legacy Condenser Redux + Redux-Saga setup under `legacy/src/app/redux/`.

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
| `transaction` | `transaction` | `store/slices/transactionSlice.ts` |
| `offchain` | `offchain` | `store/slices/offchainSlice.ts` |
| `community` | `community` | `store/slices/communitySlice.ts` |
| `userProfiles` | `userProfiles` | `store/slices/userProfilesSlice.ts` |
| `search` | `search` | `store/slices/searchSlice.ts` |
| `ad` | `ad` | `store/slices/adSlice.ts` |
| `discussion` | *(omitted)* | Legacy was a no-op reducer; nothing in the new app selects it. |
| `routing` | *(omitted)* | Replaced by **Next.js App Router** (no `react-router-redux`). |
| `form` | *(omitted)* | Legacy **redux-form** is not used; use local component state or a dedicated form approach per feature. |

Legacy state used **Immutable.js** (`Map` / `fromJS`). New slices use **plain objects** and Immer via RTK.

## Legacy saga modules (reference only)

These files live under `legacy/src/app/redux/`. They are **not** replicated as TypeScript sagas. The table below is a high-level map of responsibilities to the new stack patterns.

| Legacy module | Responsibility (summary) | New-stack direction |
|---------------|---------------------------|---------------------|
| `AuthSaga.js` | Authority lookup, key-related auth flows | `lib/api/auth`, `store/thunks/authThunks.ts`, login/session UI |
| `UserSaga.js` | User-related side effects | `userSlice` + thunks + `app/api/*` where needed |
| `TransactionSaga.js` | Transaction / broadcast orchestration | `transactionSlice`; Steem operations via API routes / client libs as features land |
| `FetchDataSaga.js` | Route-driven fetch, communities, tags, followers, notices | Page-level data in **RSC** / **Route Handlers** / `lib/api/steem.ts` |
| `GlobalSaga.js` | Dynamic global properties (e.g. DGP) | Fetch on demand or from API; optional thunk if global cache is required |
| `PollingSaga.js` | Background polling | Not ported; consider intervals in hooks, **RTK Query** polling, or server push if required |
| `FollowSaga.js` | Follow graph loading | `lib/api` + pages/components |
| `CommunitySaga.js`, `CommunitySearchSaga.js` | Community data and search | `communitySlice` + API + pages |
| `SearchSaga.js` | Search requests | `app/api/search/route.ts`, `searchSlice` |
| `UserProfilesSaga.js` | Profile hydration | `userProfilesSlice` + fetches from Steem/offchain APIs |

## Functional parity and gaps

- **Phase-two closure:** Structural parity for named legacy reducer domains is satisfied by the slices listed above. **Saga-level parity is not a goal** for the new stack unless a future ADR reintroduces orchestration tooling.
- **Verification:** As features migrate from `legacy/`, compare critical user flows (login, vote, post, wallet) against legacy behavior; extend thunks or server endpoints where state or timing still diverges.

## Optional future work

- **RTK Query:** Add for normalized caching and deduplication if client-side fetching becomes heavy.
- **Redux-Saga (only if needed):** Would require an explicit ADR, new dependency, and a maintenance story; not planned today.
