-- Query celebrities by a single category 
SELECT * from celebrities WHERE "politics" = ANY(categories);

-- Query celebrities by multiple categories
SELECT * from celebrities WHERE "politics" = ANY(categories) or "sports" = ANY(categories);

-- Query celebrities by a specific category and life path
SELECT
  *
FROM
  celebrities
WHERE
  'politics' = ANY (categories)
  AND "life_path" = 7;