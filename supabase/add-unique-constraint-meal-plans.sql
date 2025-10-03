-- Add unique constraint on user_id for meal_plans_app table
-- This allows upsert operations (one plan per user)

ALTER TABLE meal_plans_app
ADD CONSTRAINT meal_plans_app_user_id_unique UNIQUE (user_id);

-- Comment: This ensures each user can only have ONE active meal plan
-- When a new plan is generated, it will replace the old one
