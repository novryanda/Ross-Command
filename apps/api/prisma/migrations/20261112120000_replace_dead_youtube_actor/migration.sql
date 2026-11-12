-- apify~youtube-scraper returns 404 on the Apify API. Existing installs keep it in the saved
-- settings row, which the seed does not touch, so point that one key at the replacement.
-- Rows where an admin chose another YouTube actor are left alone.
UPDATE "system_settings"
SET "apify_actors" = jsonb_set("apify_actors", '{youtube}', '"johnvc~youtube-shorts-api"'::jsonb)
WHERE "apify_actors"->>'youtube' IN ('apify~youtube-scraper', 'apify/youtube-scraper');