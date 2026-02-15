-- Add status columns to project table
ALTER TABLE project 
ADD COLUMN IF NOT EXISTS timingstatus varchar(50) DEFAULT 'On Track',
ADD COLUMN IF NOT EXISTS timingjustification text,
ADD COLUMN IF NOT EXISTS budgetstatus varchar(50) DEFAULT 'On Track',
ADD COLUMN IF NOT EXISTS budgetjustification text,
ADD COLUMN IF NOT EXISTS scopestatus varchar(50) DEFAULT 'On Track',
ADD COLUMN IF NOT EXISTS scopejustification text;

-- Update existing rows to have default values if null
UPDATE project SET timingstatus = 'On Track' WHERE timingstatus IS NULL;
UPDATE project SET budgetstatus = 'On Track' WHERE budgetstatus IS NULL;
UPDATE project SET scopestatus = 'On Track' WHERE scopestatus IS NULL;
