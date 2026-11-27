# Task distribution

Software Evolution & Re-Engineering, Fall 2026. Re-engineering of [shamahoque/mern-marketplace](https://github.com/shamahoque/mern-marketplace) (`second-edition` branch, commit `bf3fc45`, tagged `baseline` in this fork).

Each member owned one area of the code through all four project phases and wrote that area's report section. Each member also took one shared duty that served the whole team.

## Summary

| | Member A | Member B | Member C |
|---|---|---|---|
| **Name** | Subaina Monib | Zainab Khalil | Adeela Nasir |
| **Area** | Backend core: config, server entry, Express setup, auth and user modules, Stripe payments | Domain modules: shops, products, orders, auctions, live bidding | Client: everything in `client/` |
| **Branch / PR** | `refactor/backend-core`, PR #2 | `refactor/domain`, PR #4 | `refactor/client` |
| **Commits** | 22 (13 Nov) | 23 (16 Nov) | 15 (27–28 Nov) |
| **Shared duty** | Test setup: Jest, supertest, in-memory MongoDB, shared helpers | Metrics: jscpd, Plato, madge and ESLint at baseline and final, comparison tables | Final report and presentation slides |
| **Report section** | `docs/architecture.md` (architecture and changes; defect evidence to be added) | `docs/report-member-b.md` | `docs/report-member-c.md` |

## Phase-by-phase

| Phase | Member A | Member B | Member C |
|---|---|---|---|
| 1. Understanding | Architecture and request-lifecycle diagrams (`6c79bae`) | Data model / ER diagram, checkout and bidding sequence diagrams (`53a07cb`) | Client structure: components, auth and cart state, API modules (report §2) |
| 2. Evaluation | D-02, D-03, D-06, D-07, D-08, BUG-3 | D-01, D-04, D-05, D-14–D-17, BUG-1, BUG-2, BUG-4 | D-09–D-13, BUG-5 |
| 3. Re-engineering | Secrets to `.env` (D-06); `HttpError`, `asyncHandler`, central error middleware (D-02, D-07); Stripe payment service (D-03); scrypt hashing and access checks (D-08) | Upload/ownership middleware (D-01); service layer (D-04); bidding socket module (D-05); domain security and integrity fixes (D-14–D-17) | Shared API client (D-09); shared form pieces (D-10); `AuthContext` / `useAuth` (D-11); shared storage helper (D-12); shared styles and theme colours (D-13) |
| 4. Evidence | Characterization tests for auth, user, payment, errors, config | Baseline and final metrics (`reports/baseline`, `reports/final`, `COMPARISON.md`); domain tests | Client tests: API request, storage, page and CSS snapshots; client metrics (`reports/final-c`) |

## Defects and bugs by owner

| ID | Owner | Commit(s) |
|---|---|---|
| D-01 Duplicated upload, image and ownership code | B | `5be5ea9`, `f142ed5`, `92aa31d` |
| D-02 Repeated error-handling blocks | A (core), B (domain) | `8d8a083`, `e54de0c`, `4587543`; `20812fd` |
| D-03 Stripe logic inside the user controller | A | `7d83726` |
| D-04 No service layer | B | `7b69fae`, `c196c9f`, `a1da027`, `8a5ebf3` |
| D-05 Socket setup inside a controller | B | `f5988ed` |
| D-06 Hard-coded secrets | A | `e4bd049`, `bb2b2bd`, `53e6b2d` |
| D-07 Inconsistent error responses | A, B | `e54de0c`, `4587543`; `350eb52` |
| D-08 Weak password hashing and missing access checks | A | `9f1a7ad`, `5d0d7cc`, `9a13e9a`, `46b096c` |
| D-09 38 duplicated `fetch` blocks | C | `31296a4` |
| D-10 Duplicated New/Edit form code and auction helpers | C | `ebf1e8a`, `c040f7e` |
| D-11 Sign-in state read from storage in 28 components | C | `211f765` |
| D-12 Repeated storage access in cart and auth helpers | C | `0e7b0e9` |
| D-13 Duplicated form styles and hard-coded colours | C | `9b29161` |
| D-14 Product/shop membership not checked | B | `993ff8f` |
| D-15 Order status update not scoped to the shop | B | `86d9545` |
| D-16 Bids not validated on the server | B | `826d442` |
| D-17 Deleting a shop left its products | B | `b5295dd` |
| BUG-1 Unawaited shop and auction removal | B | `c83db79` |
| BUG-2 Upload error handler sent two responses | B | `81faf6a` |
| BUG-3 Failed Stripe calls hung or crashed | A | `150e0f0` |
| BUG-4 Rejected bid broadcast a null auction | B | `e2e1398` |
| BUG-5 October auction dates came out as "010" | C | `5c4e19f` |

## Results at a glance

| Measure | Baseline | Final |
|---|---:|---:|
| Automated tests | 0 | 205 |
| Whole-project duplication | 13.53% | 8.07% |
| Clone pairs | 73 | 46 |

Sources: `reports/COMPARISON.md`, `reports/final-c/SUMMARY.md`. The commit list for each member can be reproduced with `git log --no-merges --author="<name>" baseline..main`.
