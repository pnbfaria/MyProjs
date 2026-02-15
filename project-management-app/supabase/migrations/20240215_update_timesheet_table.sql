-- Add estworkload column to timesheet table
ALTER TABLE timesheet 
ADD COLUMN IF NOT EXISTS estworkload numeric;

-- Add unique constraint to prevent duplicate entries for the same user, project, and month/year
-- This assumes that useremail column exists as per the screenshot provided
ALTER TABLE timesheet
ADD CONSTRAINT timesheet_user_project_period_key UNIQUE (useremail, projectid, month, year);
