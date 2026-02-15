-- Enable RLS on the correct table "Client"
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access (select, insert, update, delete) to everyone (anon and authenticated)
-- We use a generic policy name to avoid conflicts if one exists, but dropping first is safer
DROP POLICY IF EXISTS "Enable access for all users" ON "Client";

CREATE POLICY "Enable access for all users" ON "Client"
FOR ALL
USING (true)
WITH CHECK (true);
