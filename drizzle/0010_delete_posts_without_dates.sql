-- Delete feed entries with bad/incomplete data: missing dates or empty required fields.
DELETE FROM feed_entries
WHERE published_at IS NULL
   OR title = ''
   OR url = ''
   OR guid = ''
   OR bot_username = '';