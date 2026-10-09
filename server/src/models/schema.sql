-- WanderWise PostgreSQL Database Schema
-- Optimized for production PostgreSQL deployment (Render, Docker, Supabase, Neon)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT 'Passionate traveler exploring the world.',
  travel_style VARCHAR(100) DEFAULT 'Cultural & Adventure',
  currency VARCHAR(10) DEFAULT 'PHP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Philippines',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  best_season VARCHAR(100) DEFAULT 'Dry Season (Nov-May)',
  estimated_daily_cost NUMERIC(10, 2) DEFAULT 3000.00,
  tags VARCHAR(255) DEFAULT 'Beach, Island Hopping, Nature',
  rating NUMERIC(3, 2) DEFAULT 4.9,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  estimated_budget NUMERIC(12, 2) DEFAULT 0.00,
  cover_image TEXT,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_activities (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  activity_date DATE,
  time_slot VARCHAR(50) DEFAULT '09:00 AM',
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
  category VARCHAR(50) DEFAULT 'sightseeing',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorite_destinations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, destination_id)
);
