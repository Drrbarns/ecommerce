-- ========================================
-- CREATE ADMIN USER (SIMPLIFIED)
-- ========================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN
-- ========================================

-- Method 1: Using Supabase's built-in function (RECOMMENDED)
-- This is the safest and simplest way

SELECT auth.uid() AS "Make sure you're not logged in, then run this:";

-- Create user via SQL
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
VALUES (
    gen_random_uuid(),
    'info@doctorbarns.com',
    crypt('Katalambano@8', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    ''
);

-- Verify the user was created
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'info@doctorbarns.com';
