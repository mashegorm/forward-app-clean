FORWARD Live v11 — Linear / Private Institution

Visual refinement over the existing live Supabase platform.

Changes:
- Linear-inspired layout, spacing and hierarchy
- Ultra-black private institution look
- Cleaner cards and room structure
- Search access rooms
- General Access & Announcements forced first
- Gender field preserved
- Supabase/database logic preserved

If gender column has not been added yet, run:
alter table forward_members add column if not exists gender text;

Admin code:
FORWARD-ADMIN-2026
