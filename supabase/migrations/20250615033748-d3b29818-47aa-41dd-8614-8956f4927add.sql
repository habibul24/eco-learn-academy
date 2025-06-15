
-- Update the price of the "How ESG works in business" course to 5 HKD
-- (Assuming only one such course exists as per your seed data)

UPDATE courses
SET price = 5
WHERE title = 'How ESG works in business';

-- If you plan to support multiple currencies in the future, consider adding a currency column to the courses table.
-- But for now, payment edge functions will honor "hkd" regardless of course table.
