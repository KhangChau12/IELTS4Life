-- ================================================================
-- Size report for migration 035 cleanup
-- Run this in Supabase SQL Editor BEFORE and AFTER the migration
-- ================================================================
--
-- BEFORE  → 3 tables show real size + row count
-- AFTER   → those rows disappear (tables gone), total DB shrinks

SELECT
  label,
  size,
  est_rows
FROM (

  -- 1. Total database size
  SELECT
    0                                          AS sort,
    '📦 TOTAL DATABASE'                        AS label,
    pg_size_pretty(pg_database_size(current_database())) AS size,
    NULL::text                                 AS est_rows

  UNION ALL

  -- 2. Each table being dropped
  SELECT
    1                                          AS sort,
    '🗑  ' || c.relname                        AS label,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS size,
    c.reltuples::bigint::text || ' rows'       AS est_rows
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname IN ('token_usage', 'vocabulary_views', 'quiz_results')

  UNION ALL

  -- 3. Subtotal of wasted space
  SELECT
    2                                          AS sort,
    '💥 WASTED SPACE (above 3 tables)'         AS label,
    pg_size_pretty(
      COALESCE(SUM(pg_total_relation_size(c.oid)), 0)
    )                                          AS size,
    COALESCE(SUM(c.reltuples::bigint), 0)::text || ' rows total' AS est_rows
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname IN ('token_usage', 'vocabulary_views', 'quiz_results')

) t
ORDER BY sort, label;
