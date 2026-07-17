# Legal and geospatial data strategy

## Data sources

- MLIT Real Estate Information Library API: urban planning, hazards and property-related spatial layers.
- National Land Numerical Information: zoning, fire-prevention districts, height districts, district plans and other planning decisions.
- Project PLATEAU: 3D city models and surrounding-building context.
- e-Gov Laws: national statutes and cabinet orders.
- Municipality ordinances, technical standards, GIS portals and administrative guidance.

## Why a rule registry is required

A nationwide product cannot hard-code only the Building Standards Act. Apartment feasibility also depends on municipality-specific window-front open spaces, studio-apartment ordinances, parking/bicycle requirements, greening, landscape controls, district plans and administrative interpretations.

Each executable rule should carry:

- stable rule ID
- jurisdiction and applicable polygon
- source URL and quoted provision locator
- promulgation/effective/expiry dates
- structured inputs and outputs
- implementation version
- unit tests and benchmark parcels
- legal/architect reviewer and approval state

## Update pipeline

1. Monitor official source changes.
2. Extract candidate amendments into a staging rule.
3. Produce a semantic diff and affected-test list.
4. Have a qualified reviewer approve it.
5. Run regression parcels and release a dated rule pack.
6. Preserve the prior version for audit and reproducibility.

## Safety boundary

The service should label results as preliminary feasibility, surface unknowns, and prevent “compliant” status when required source data is missing or stale. Final design and permit submission require licensed professionals and the relevant authority or confirmation body.
