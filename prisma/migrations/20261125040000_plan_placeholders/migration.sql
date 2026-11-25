-- Floor and unit plans used to be stored as inline SVG data URIs (tens of KB per house, sent
-- with every houses request). Replace them with the static placeholder drawings from /images.
-- Plans that were uploaded as real images (/uploads/..., https://...) are left untouched.

UPDATE "houses"
SET "floor_plans" = COALESCE((
  SELECT jsonb_agg(
    CASE WHEN elem->>'img' LIKE 'data:image/svg+xml%'
      THEN jsonb_set(elem, '{img}', '"/images/plan-floor-placeholder.svg"'::jsonb)
      ELSE elem
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements("floor_plans") WITH ORDINALITY AS t(elem, ord)
), '[]'::jsonb)
WHERE jsonb_typeof("floor_plans") = 'array'
  AND "floor_plans"::text LIKE '%data:image/svg+xml%';

UPDATE "houses"
SET "unit_plans" = COALESCE((
  SELECT jsonb_agg(
    CASE WHEN elem->>'img' LIKE 'data:image/svg+xml%'
      THEN jsonb_set(elem, '{img}', '"/images/plan-unit-placeholder.svg"'::jsonb)
      ELSE elem
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements("unit_plans") WITH ORDINALITY AS t(elem, ord)
), '[]'::jsonb)
WHERE jsonb_typeof("unit_plans") = 'array'
  AND "unit_plans"::text LIKE '%data:image/svg+xml%';
