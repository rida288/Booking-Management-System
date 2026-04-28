-- =============================================================
-- SEED FILE: Smart Hotel Booking & Reservation Management System
-- BCNF-Compliant Schema
-- =============================================================
-- Order of inserts respects FK dependencies:
--   Users → Hotels → Amenity → Hotel_Amenities
--   → Room_Types → Room_Type_Amenities → Room_Defects
--   → Bookings → Payments → Refunds → Reviews
--   → Event_Spaces → Event_Space_Amenities
--   → Event_Bookings
--   → Event_Booking_Series → Event_Booking_Occurrences
-- =============================================================

USE Booking_Management_System;
GO

-- =============================================================
-- 1. USERS
-- Roles: ADMIN (1), HOST (3), GUEST (6)
-- =============================================================

INSERT INTO Users (user_id, email, password_hash, full_name, phone_number, role, is_active)
VALUES
-- Admin
(
    'A0000000-0000-0000-0000-000000000001',
    'admin@hotelsys.com',
    '$2b$12$adminHashedPassword001',
    'System Administrator',
    '+10000000001',
    'ADMIN',
    1
),

-- Hosts
(
    'B0000000-0000-0000-0000-000000000001',
    'john.host@resorts.com',
    '$2b$12$hostHashedPassword001',
    'John Mercer',
    '+10000000002',
    'HOST',
    1
),
(
    'B0000000-0000-0000-0000-000000000002',
    'sara.host@hotels.com',
    '$2b$12$hostHashedPassword002',
    'Sara Khan',
    '+10000000003',
    'HOST',
    1
),
(
    'B0000000-0000-0000-0000-000000000003',
    'carlos.host@stays.com',
    '$2b$12$hostHashedPassword003',
    'Carlos Rivera',
    '+10000000004',
    'HOST',
    1
),

-- Guests
(
    'C0000000-0000-0000-0000-000000000001',
    'alice.guest@gmail.com',
    '$2b$12$guestHashedPassword001',
    'Alice Thompson',
    '+10000000005',
    'GUEST',
    1
),
(
    'C0000000-0000-0000-0000-000000000002',
    'bob.guest@gmail.com',
    '$2b$12$guestHashedPassword002',
    'Bob Williams',
    '+10000000006',
    'GUEST',
    1
),
(
    'C0000000-0000-0000-0000-000000000003',
    'charlie.guest@gmail.com',
    '$2b$12$guestHashedPassword003',
    'Charlie Davis',
    '+10000000007',
    'GUEST',
    1
),
(
    'C0000000-0000-0000-0000-000000000004',
    'diana.guest@gmail.com',
    '$2b$12$guestHashedPassword004',
    'Diana Patel',
    '+10000000008',
    'GUEST',
    1
),
(
    'C0000000-0000-0000-0000-000000000005',
    'ethan.guest@gmail.com',
    '$2b$12$guestHashedPassword005',
    'Ethan Nguyen',
    '+10000000009',
    'GUEST',
    1
),
(
    'C0000000-0000-0000-0000-000000000006',
    'fatima.guest@gmail.com',
    '$2b$12$guestHashedPassword006',
    'Fatima Malik',
    '+10000000010',
    'GUEST',
    0   -- deactivated account example
);
GO

-- =============================================================
-- 2. HOTELS  (3 hotels, one per host)
-- =============================================================

INSERT INTO Hotels (hotel_id, host_id, name, description, address, city, province, country, star_rating, check_in_time, check_out_time, cancellation_policy)
VALUES
(
    'D0000000-0000-0000-0000-000000000001',
    'B0000000-0000-0000-0000-000000000001',
    'Grand Ocean Resort',
    'Award-winning beachfront resort with panoramic sea views, world-class spa, and gourmet dining.',
    '123 Ocean Drive',
    'Miami',
    'Florida',
    'USA',
    5,
    '15:00:00',
    '11:00:00',
    'Free cancellation up to 48 hours before check-in. After that, one night charge applies.'
),
(
    'D0000000-0000-0000-0000-000000000002',
    'B0000000-0000-0000-0000-000000000002',
    'The Lahore Pearl',
    'Elegant business hotel in the heart of Lahore with conference facilities and rooftop dining.',
    '45 Mall Road',
    'Lahore',
    'Punjab',
    'Pakistan',
    4,
    '14:00:00',
    '12:00:00',
    'Free cancellation up to 24 hours before check-in. No-show is charged full amount.'
),
(
    'D0000000-0000-0000-0000-000000000003',
    'B0000000-0000-0000-0000-000000000003',
    'Casa del Sol',
    'Charming boutique hotel nestled in the historic quarter of Barcelona with rooftop terrace.',
    '8 Carrer de Provença',
    'Barcelona',
    'Catalonia',
    'Spain',
    4,
    '14:00:00',
    '11:00:00',
    'Non-refundable rate. Cancellation results in full charge.'
);
GO

-- =============================================================
-- 3. AMENITIES  (shared pool across hotels and room types)
-- =============================================================

INSERT INTO Amenity (amenity_id, name)
VALUES
('E0000000-0000-0000-0000-000000000001', 'Free WiFi'),
('E0000000-0000-0000-0000-000000000002', 'Swimming Pool'),
('E0000000-0000-0000-0000-000000000003', 'Gym & Fitness Center'),
('E0000000-0000-0000-0000-000000000004', 'Spa & Wellness'),
('E0000000-0000-0000-0000-000000000005', 'Airport Shuttle'),
('E0000000-0000-0000-0000-000000000006', 'Restaurant'),
('E0000000-0000-0000-0000-000000000007', '24-Hour Room Service'),
('E0000000-0000-0000-0000-000000000008', 'Flat-Screen TV'),
('E0000000-0000-0000-0000-000000000009', 'Mini Bar'),
('E0000000-0000-0000-0000-000000000010', 'Air Conditioning'),
('E0000000-0000-0000-0000-000000000011', 'Parking'),
('E0000000-0000-0000-0000-000000000012', 'Projector & Screen'),
('E0000000-0000-0000-0000-000000000013', 'Whiteboard'),
('E0000000-0000-0000-0000-000000000014', 'Conference Seating'),
('E0000000-0000-0000-0000-000000000015', 'Beachfront Access');
GO

-- =============================================================
-- 4. HOTEL AMENITIES  (junction)
-- =============================================================

INSERT INTO Hotel_Amenities (hotel_id, amenity_id)
VALUES
-- Grand Ocean Resort
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000002'),  -- Pool
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000003'),  -- Gym
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000004'),  -- Spa
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000005'),  -- Shuttle
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000006'),  -- Restaurant
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000011'),  -- Parking
('D0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000015'),  -- Beachfront

-- The Lahore Pearl
('D0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('D0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000003'),  -- Gym
('D0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000006'),  -- Restaurant
('D0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000007'),  -- Room Service
('D0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000011'),  -- Parking

-- Casa del Sol
('D0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('D0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000002'),  -- Pool
('D0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000006'),  -- Restaurant
('D0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000010');  -- AC
GO

-- =============================================================
-- 5. ROOM TYPES  (2-3 per hotel)
-- =============================================================

INSERT INTO Room_Types (room_type_id, hotel_id, type_name, description, max_occupancy, total_rooms, base_price_per_night, size_sqft, bed_type)
VALUES
-- Grand Ocean Resort
(
    'F0000000-0000-0000-0000-000000000001',
    'D0000000-0000-0000-0000-000000000001',
    'Standard King',
    'Comfortable room with king bed and partial ocean view.',
    2, 20, 250.00, 380.00, 'King'
),
(
    'F0000000-0000-0000-0000-000000000002',
    'D0000000-0000-0000-0000-000000000001',
    'Ocean Suite',
    'Spacious suite with panoramic ocean views, private balcony, and jacuzzi.',
    3, 8, 520.00, 720.00, 'King'
),
(
    'F0000000-0000-0000-0000-000000000003',
    'D0000000-0000-0000-0000-000000000001',
    'Family Bungalow',
    'Two-bedroom beachfront bungalow ideal for families.',
    6, 5, 780.00, 1100.00, 'Double Queen'
),

-- The Lahore Pearl
(
    'F0000000-0000-0000-0000-000000000004',
    'D0000000-0000-0000-0000-000000000002',
    'Deluxe Room',
    'Modern room with city view and high-speed internet.',
    2, 30, 120.00, 320.00, 'Queen'
),
(
    'F0000000-0000-0000-0000-000000000005',
    'D0000000-0000-0000-0000-000000000002',
    'Executive Suite',
    'Luxurious suite with separate living area and premium amenities.',
    2, 10, 220.00, 560.00, 'King'
),

-- Casa del Sol
(
    'F0000000-0000-0000-0000-000000000006',
    'D0000000-0000-0000-0000-000000000003',
    'Classic Double',
    'Cozy room in the historic wing with terracotta tiles and garden view.',
    2, 15, 160.00, 300.00, 'Double'
),
(
    'F0000000-0000-0000-0000-000000000007',
    'D0000000-0000-0000-0000-000000000003',
    'Rooftop Studio',
    'Studio apartment with private rooftop terrace and city skyline views.',
    2, 4, 340.00, 480.00, 'King'
);
GO

-- =============================================================
-- 6. ROOM TYPE AMENITIES  (junction)
-- =============================================================

INSERT INTO Room_Type_Amenities (room_type_id, amenity_id)
VALUES
-- Standard King
('F0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Ocean Suite
('F0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000007'),  -- Room Service
('F0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000009'),  -- Mini Bar
('F0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Family Bungalow
('F0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000007'),  -- Room Service
('F0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Deluxe Room
('F0000000-0000-0000-0000-000000000004', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000004', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000004', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Executive Suite
('F0000000-0000-0000-0000-000000000005', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000005', 'E0000000-0000-0000-0000-000000000007'),  -- Room Service
('F0000000-0000-0000-0000-000000000005', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000005', 'E0000000-0000-0000-0000-000000000009'),  -- Mini Bar
('F0000000-0000-0000-0000-000000000005', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Classic Double
('F0000000-0000-0000-0000-000000000006', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000006', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000006', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Rooftop Studio
('F0000000-0000-0000-0000-000000000007', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('F0000000-0000-0000-0000-000000000007', 'E0000000-0000-0000-0000-000000000008'),  -- TV
('F0000000-0000-0000-0000-000000000007', 'E0000000-0000-0000-0000-000000000009'),  -- Mini Bar
('F0000000-0000-0000-0000-000000000007', 'E0000000-0000-0000-0000-000000000010');  -- AC
GO

-- =============================================================
-- 7. ROOM DEFECTS
-- One CRITICAL (will trigger trg_AutoDisableRoomType),
-- one RESOLVED, one OPEN medium
-- =============================================================

INSERT INTO Room_Defects (defect_id, room_type_id, reported_by, title, description, severity, status, reported_at, resolved_at)
VALUES
(
    'G0000000-0000-0000-0000-000000000001',
    'F0000000-0000-0000-0000-000000000001',  -- Standard King
    'C0000000-0000-0000-0000-000000000001',  -- Alice (guest reporter)
    'AC Unit Leaking Water',
    'The ceiling AC unit is dripping water onto the bed. Mattress is damp.',
    'CRITICAL',
    'IN_PROGRESS',
    '2026-03-10 08:30:00',
    NULL
),
(
    'G0000000-0000-0000-0000-000000000002',
    'F0000000-0000-0000-0000-000000000004',  -- Deluxe Room
    'B0000000-0000-0000-0000-000000000002',  -- Sara (host)
    'Broken Shower Handle',
    'The shower handle is loose and cannot control temperature properly.',
    'HIGH',
    'RESOLVED',
    '2026-02-20 11:00:00',
    '2026-02-22 14:00:00'
),
(
    'G0000000-0000-0000-0000-000000000003',
    'F0000000-0000-0000-0000-000000000006',  -- Classic Double
    'C0000000-0000-0000-0000-000000000003',  -- Charlie (guest)
    'Flickering Bedside Lamp',
    'The lamp on the left bedside table flickers intermittently.',
    'LOW',
    'OPEN',
    '2026-04-01 20:15:00',
    NULL
);
GO

-- =============================================================
-- 8. BOOKINGS  (BCNF: no hotel_id, no total_amount stored)
-- Status mix: COMPLETED, CONFIRMED, CANCELLED, PENDING
-- =============================================================

INSERT INTO Bookings
    (booking_id, guest_id, room_type_id,
     check_in_date, check_out_date, num_guests, num_rooms,
     base_price_per_night, discount_percent,
     status, cancellation_reason, cancelled_at)
VALUES
-- COMPLETED booking — Alice at Grand Ocean Resort (Standard King, 5 nights)
(
    'H0000000-0000-0000-0000-000000000001',
    'C0000000-0000-0000-0000-000000000001',
    'F0000000-0000-0000-0000-000000000001',
    '2026-01-10', '2026-01-15', 2, 1,
    250.00, 0.00,
    'COMPLETED', NULL, NULL
),
-- COMPLETED booking — Bob at The Lahore Pearl (Deluxe Room, 3 nights)
(
    'H0000000-0000-0000-0000-000000000002',
    'C0000000-0000-0000-0000-000000000002',
    'F0000000-0000-0000-0000-000000000004',
    '2026-02-05', '2026-02-08', 2, 1,
    120.00, 10.00,   -- 10% overbooking discount applied
    'COMPLETED', NULL, NULL
),
-- CONFIRMED booking — Charlie at Casa del Sol (Classic Double, 4 nights)
(
    'H0000000-0000-0000-0000-000000000003',
    'C0000000-0000-0000-0000-000000000003',
    'F0000000-0000-0000-0000-000000000006',
    '2026-05-01', '2026-05-05', 2, 1,
    160.00, 0.00,
    'CONFIRMED', NULL, NULL
),
-- CONFIRMED booking — Diana at Grand Ocean Resort (Ocean Suite, 2 nights)
(
    'H0000000-0000-0000-0000-000000000004',
    'C0000000-0000-0000-0000-000000000004',
    'F0000000-0000-0000-0000-000000000002',
    '2026-05-20', '2026-05-22', 2, 1,
    520.00, 0.00,
    'CONFIRMED', NULL, NULL
),
-- CANCELLED booking — Ethan at Grand Ocean Resort (Family Bungalow)
(
    'H0000000-0000-0000-0000-000000000005',
    'C0000000-0000-0000-0000-000000000005',
    'F0000000-0000-0000-0000-000000000003',
    '2026-03-15', '2026-03-20', 4, 1,
    780.00, 0.00,
    'CANCELLED', 'Change of travel plans', '2026-03-10 09:00:00'
),
-- PENDING booking — Alice at The Lahore Pearl (Executive Suite)
(
    'H0000000-0000-0000-0000-000000000006',
    'C0000000-0000-0000-0000-000000000001',
    'F0000000-0000-0000-0000-000000000005',
    '2026-06-01', '2026-06-04', 2, 1,
    220.00, 0.00,
    'PENDING', NULL, NULL
),
-- COMPLETED booking — Bob at Casa del Sol (Rooftop Studio, 7 nights)
(
    'H0000000-0000-0000-0000-000000000007',
    'C0000000-0000-0000-0000-000000000002',
    'F0000000-0000-0000-0000-000000000007',
    '2026-02-10', '2026-02-17', 1, 1,
    340.00, 0.00,
    'COMPLETED', NULL, NULL
),
-- NO_SHOW — Charlie at The Lahore Pearl (Deluxe Room)
(
    'H0000000-0000-0000-0000-000000000008',
    'C0000000-0000-0000-0000-000000000003',
    'F0000000-0000-0000-0000-000000000004',
    '2026-01-25', '2026-01-27', 2, 1,
    120.00, 0.00,
    'NO_SHOW', NULL, NULL
);
GO

-- =============================================================
-- 9. PAYMENTS
-- CHARGE payments for all bookings; REFUND for cancellation
-- =============================================================

INSERT INTO Payments
    (payment_id, booking_id, guest_id, payment_type, amount, payment_method, payment_gateway, status, initiated_at, completed_at)
VALUES
-- Booking 1: Alice COMPLETED — charge paid
(
    'I0000000-0000-0000-0000-000000000001',
    'H0000000-0000-0000-0000-000000000001',
    'C0000000-0000-0000-0000-000000000001',
    'CHARGE', 1250.00,   -- 250 * 1 room * 5 nights
    'CREDIT_CARD', 'Stripe',
    'SUCCESSFUL',
    '2025-12-20 10:00:00', '2025-12-20 10:00:30'
),
-- Booking 2: Bob COMPLETED — charge with 10% discount
(
    'I0000000-0000-0000-0000-000000000002',
    'H0000000-0000-0000-0000-000000000002',
    'C0000000-0000-0000-0000-000000000002',
    'CHARGE', 324.00,    -- 120 * 3 nights * 0.90
    'DEBIT_CARD', 'PayFast',
    'SUCCESSFUL',
    '2026-01-28 14:00:00', '2026-01-28 14:00:20'
),
-- Booking 3: Charlie CONFIRMED — charge paid upfront
(
    'I0000000-0000-0000-0000-000000000003',
    'H0000000-0000-0000-0000-000000000003',
    'C0000000-0000-0000-0000-000000000003',
    'CHARGE', 640.00,    -- 160 * 4 nights
    'WALLET', 'PayPal',
    'SUCCESSFUL',
    '2026-04-10 09:30:00', '2026-04-10 09:30:15'
),
-- Booking 4: Diana CONFIRMED — charge
(
    'I0000000-0000-0000-0000-000000000004',
    'H0000000-0000-0000-0000-000000000004',
    'C0000000-0000-0000-0000-000000000004',
    'CHARGE', 1040.00,   -- 520 * 2 nights
    'CREDIT_CARD', 'Stripe',
    'SUCCESSFUL',
    '2026-05-01 11:00:00', '2026-05-01 11:00:25'
),
-- Booking 5: Ethan CANCELLED — original charge (marked REFUNDED by trigger)
(
    'I0000000-0000-0000-0000-000000000005',
    'H0000000-0000-0000-0000-000000000005',
    'C0000000-0000-0000-0000-000000000005',
    'CHARGE', 3900.00,   -- 780 * 5 nights
    'CREDIT_CARD', 'Stripe',
    'REFUNDED',
    '2026-03-01 08:00:00', '2026-03-10 09:05:00'
),
-- Booking 5: Ethan CANCELLED — auto-refund payment (created by trg_AutoRefund)
(
    'I0000000-0000-0000-0000-000000000006',
    'H0000000-0000-0000-0000-000000000005',
    'C0000000-0000-0000-0000-000000000005',
    'REFUND', 3900.00,
    'CREDIT_CARD', NULL,
    'PENDING',
    '2026-03-10 09:01:00', NULL
),
-- Booking 6: Alice PENDING — payment not yet made
(
    'I0000000-0000-0000-0000-000000000007',
    'H0000000-0000-0000-0000-000000000006',
    'C0000000-0000-0000-0000-000000000001',
    'CHARGE', 660.00,    -- 220 * 3 nights
    'BANK_TRANSFER', NULL,
    'PENDING',
    '2026-05-15 16:00:00', NULL
),
-- Booking 7: Bob COMPLETED — Rooftop Studio charge
(
    'I0000000-0000-0000-0000-000000000008',
    'H0000000-0000-0000-0000-000000000007',
    'C0000000-0000-0000-0000-000000000002',
    'CHARGE', 2380.00,   -- 340 * 7 nights
    'CREDIT_CARD', 'Stripe',
    'SUCCESSFUL',
    '2026-01-20 13:00:00', '2026-01-20 13:00:18'
),
-- Booking 8: Charlie NO_SHOW — charge still applies
(
    'I0000000-0000-0000-0000-000000000009',
    'H0000000-0000-0000-0000-000000000008',
    'C0000000-0000-0000-0000-000000000003',
    'CHARGE', 240.00,    -- 120 * 2 nights
    'DEBIT_CARD', 'PayFast',
    'SUCCESSFUL',
    '2026-01-15 10:00:00', '2026-01-15 10:00:12'
);
GO

-- =============================================================
-- 10. REFUNDS
-- BCNF: no booking_id stored — derivable via payment_id → Payments.booking_id
-- =============================================================

INSERT INTO Refunds
    (refund_id, payment_id, refund_amount, refund_reason, initiated_by, status, initiated_at, completed_at)
VALUES
(
    'J0000000-0000-0000-0000-000000000001',
    'I0000000-0000-0000-0000-000000000006',   -- refund payment for Ethan's cancelled booking
    3900.00,
    'Change of travel plans',
    'C0000000-0000-0000-0000-000000000005',   -- initiated by Ethan (guest)
    'PENDING',
    '2026-03-10 09:01:00',
    NULL
);
GO

-- =============================================================
-- 11. REVIEWS
-- BCNF: no guest_id / hotel_id / room_type_id — all derivable via booking_id
-- Only COMPLETED bookings can have reviews
-- =============================================================

INSERT INTO Reviews
    (review_id, booking_id, overall_rating, title, body, host_response, host_responded_at)
VALUES
-- Alice reviews Grand Ocean Resort (Booking 1)
(
    'K0000000-0000-0000-0000-000000000001',
    'H0000000-0000-0000-0000-000000000001',
    4.5,
    'Stunning views, exceptional service',
    'The ocean view from our room was breathtaking. Staff were attentive and warm. The only minor issue was a slight delay in room service one evening, but overall a fantastic stay.',
    'Thank you so much, Alice! We hope to welcome you back soon.',
    '2026-01-20 10:00:00'
),
-- Bob reviews The Lahore Pearl (Booking 2)
(
    'K0000000-0000-0000-0000-000000000002',
    'H0000000-0000-0000-0000-000000000002',
    4.0,
    'Great business hotel in a prime location',
    'Excellent location on Mall Road. The conference room facilities were top-notch. Room was clean and well-equipped. Would return for my next Lahore trip.',
    NULL,
    NULL
),
-- Bob reviews Casa del Sol (Booking 7)
(
    'K0000000-0000-0000-0000-000000000003',
    'H0000000-0000-0000-0000-000000000007',
    5.0,
    'Barcelona''s best kept secret',
    'The rooftop studio was magical. Waking up to Barcelona''s skyline every morning was an experience I will never forget. Carlos and his team went above and beyond.',
    'Gracias, Bob! The rooftop is our pride — delighted you loved it!',
    '2026-02-20 09:00:00'
);
GO

-- =============================================================
-- 12. EVENT SPACES  (one per hotel)
-- =============================================================

INSERT INTO Event_Spaces
    (event_space_id, hotel_id, name, space_type, capacity, hourly_rate, floor_number, setup_buffer_mins, teardown_buffer_mins)
VALUES
(
    'L0000000-0000-0000-0000-000000000001',
    'D0000000-0000-0000-0000-000000000001',
    'Coral Ballroom',
    'BALLROOM',
    300,
    450.00,
    2,
    60,   -- 60 min setup buffer
    45    -- 45 min teardown buffer
),
(
    'L0000000-0000-0000-0000-000000000002',
    'D0000000-0000-0000-0000-000000000002',
    'Pearl Conference Hall',
    'CONFERENCE',
    80,
    150.00,
    3,
    30,
    30
),
(
    'L0000000-0000-0000-0000-000000000003',
    'D0000000-0000-0000-0000-000000000003',
    'Terraza Rooftop',
    'OUTDOOR',
    50,
    200.00,
    5,
    20,
    20
);
GO

-- =============================================================
-- 13. EVENT SPACE AMENITIES  (junction)
-- =============================================================

INSERT INTO Event_Space_Amenities (event_space_id, amenity_id)
VALUES
-- Coral Ballroom
('L0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('L0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000012'),  -- Projector
('L0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000014'),  -- Conference Seating
('L0000000-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000010'),  -- AC

-- Pearl Conference Hall
('L0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('L0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000012'),  -- Projector
('L0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000013'),  -- Whiteboard
('L0000000-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000014'),  -- Conference Seating

-- Terraza Rooftop
('L0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000001'),  -- WiFi
('L0000000-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000010');  -- AC
GO

-- =============================================================
-- 14. EVENT BOOKINGS  (one-off bookings)
-- =============================================================

INSERT INTO Event_Bookings
    (booking_id, event_space_id, guest_id, event_date, start_time, end_time, status)
VALUES
-- Diana books Coral Ballroom for a wedding reception
(
    'M0000000-0000-0000-0000-000000000001',
    'L0000000-0000-0000-0000-000000000001',
    'C0000000-0000-0000-0000-000000000004',
    '2026-07-15',
    '18:00:00',
    '23:00:00',
    'CONFIRMED'
),
-- Alice books Pearl Conference Hall for a corporate workshop
(
    'M0000000-0000-0000-0000-000000000002',
    'L0000000-0000-0000-0000-000000000002',
    'C0000000-0000-0000-0000-000000000001',
    '2026-06-10',
    '09:00:00',
    '17:00:00',
    'CONFIRMED'
),
-- Ethan books Terraza Rooftop for a birthday dinner
(
    'M0000000-0000-0000-0000-000000000003',
    'L0000000-0000-0000-0000-000000000003',
    'C0000000-0000-0000-0000-000000000005',
    '2026-06-20',
    '19:00:00',
    '22:00:00',
    'PENDING'
);
GO

-- =============================================================
-- 15. EVENT BOOKING SERIES  (recurring bookings)
-- =============================================================

INSERT INTO Event_Booking_Series
    (series_id, event_space_id, guest_id, recurrence_type, interval_val, start_date, end_date, start_time, end_time)
VALUES
-- Bob books Pearl Conference Hall every Monday for weekly team standups (4 weeks)
(
    'N0000000-0000-0000-0000-000000000001',
    'L0000000-0000-0000-0000-000000000002',
    'C0000000-0000-0000-0000-000000000002',
    'WEEKLY',
    1,
    '2026-05-05',
    '2026-05-26',
    '10:00:00',
    '11:00:00'
),
-- Charlie books Terraza Rooftop on the 1st of each month for 3 months (monthly sunset event)
(
    'N0000000-0000-0000-0000-000000000002',
    'L0000000-0000-0000-0000-000000000003',
    'C0000000-0000-0000-0000-000000000003',
    'MONTHLY',
    1,
    '2026-06-01',
    '2026-08-01',
    '17:00:00',
    '20:00:00'
);
GO

-- =============================================================
-- 16. EVENT BOOKING OCCURRENCES
-- BCNF: no event_space_id — derivable via series_id → Event_Booking_Series.event_space_id
-- =============================================================

INSERT INTO Event_Booking_Occurrences
    (occurrence_id, series_id, event_date, start_time, end_time, status)
VALUES
-- Bob's weekly standups (Series N001 — Mondays in May)
(
    'O0000000-0000-0000-0000-000000000001',
    'N0000000-0000-0000-0000-000000000001',
    '2026-05-05', '10:00:00', '11:00:00', 'CONFIRMED'
),
(
    'O0000000-0000-0000-0000-000000000002',
    'N0000000-0000-0000-0000-000000000001',
    '2026-05-12', '10:00:00', '11:00:00', 'CONFIRMED'
),
(
    'O0000000-0000-0000-0000-000000000003',
    'N0000000-0000-0000-0000-000000000001',
    '2026-05-19', '10:00:00', '11:00:00', 'CONFIRMED'
),
(
    'O0000000-0000-0000-0000-000000000004',
    'N0000000-0000-0000-0000-000000000001',
    '2026-05-26', '10:00:00', '11:00:00', 'CONFIRMED'
),

-- Charlie's monthly sunset events (Series N002)
(
    'O0000000-0000-0000-0000-000000000005',
    'N0000000-0000-0000-0000-000000000002',
    '2026-06-01', '17:00:00', '20:00:00', 'CONFIRMED'
),
(
    'O0000000-0000-0000-0000-000000000006',
    'N0000000-0000-0000-0000-000000000002',
    '2026-07-01', '17:00:00', '20:00:00', 'CONFIRMED'
),
(
    'O0000000-0000-0000-0000-000000000007',
    'N0000000-0000-0000-0000-000000000002',
    '2026-08-01', '17:00:00', '20:00:00', 'CONFIRMED'
);
GO

-- =============================================================
-- VERIFICATION QUERIES  (run after seeding to sanity-check)
-- =============================================================

-- Row counts per table
SELECT 'Users'                        AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL SELECT 'Hotels',                        COUNT(*) FROM Hotels
UNION ALL SELECT 'Amenity',                       COUNT(*) FROM Amenity
UNION ALL SELECT 'Hotel_Amenities',               COUNT(*) FROM Hotel_Amenities
UNION ALL SELECT 'Room_Types',                    COUNT(*) FROM Room_Types
UNION ALL SELECT 'Room_Type_Amenities',           COUNT(*) FROM Room_Type_Amenities
UNION ALL SELECT 'Room_Defects',                  COUNT(*) FROM Room_Defects
UNION ALL SELECT 'Bookings',                      COUNT(*) FROM Bookings
UNION ALL SELECT 'Payments',                      COUNT(*) FROM Payments
UNION ALL SELECT 'Refunds',                       COUNT(*) FROM Refunds
UNION ALL SELECT 'Reviews',                       COUNT(*) FROM Reviews
UNION ALL SELECT 'Event_Spaces',                  COUNT(*) FROM Event_Spaces
UNION ALL SELECT 'Event_Space_Amenities',         COUNT(*) FROM Event_Space_Amenities
UNION ALL SELECT 'Event_Bookings',                COUNT(*) FROM Event_Bookings
UNION ALL SELECT 'Event_Booking_Series',          COUNT(*) FROM Event_Booking_Series
UNION ALL SELECT 'Event_Booking_Occurrences',     COUNT(*) FROM Event_Booking_Occurrences;
GO

-- Booking summary with computed total (BCNF — no stored total_amount)
SELECT
    b.booking_id,
    u.full_name                                             AS guest,
    rt.type_name                                            AS room_type,
    h.name                                                  AS hotel,
    b.check_in_date,
    b.check_out_date,
    DATEDIFF(DAY, b.check_in_date, b.check_out_date)       AS nights,
    b.num_rooms,
    b.base_price_per_night,
    b.discount_percent,
    -- Derived total (not stored per BCNF)
    CAST(
        b.base_price_per_night
        * b.num_rooms
        * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
        * (1.0 - b.discount_percent / 100.0)
    AS DECIMAL(12,2))                                       AS computed_total,
    b.status
FROM Bookings b
JOIN Users      u  ON u.user_id       = b.guest_id
JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id   -- hotel reached via room_type, not stored in Bookings
ORDER BY b.check_in_date;
GO

-- Reviews with full context (guest + hotel resolved through booking join)
SELECT
    r.review_id,
    u.full_name     AS reviewer,
    h.name          AS hotel,
    rt.type_name    AS room_type,
    r.overall_rating,
    r.title,
    r.created_at
FROM Reviews    r
JOIN Bookings   b  ON b.booking_id    = r.booking_id
JOIN Users      u  ON u.user_id       = b.guest_id
JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id;
GO

-- Refund audit — booking_id resolved through payment join (BCNF proof)
SELECT
    rf.refund_id,
    p.booking_id,           -- derived from payment, not stored in Refunds
    u.full_name AS guest,
    rf.refund_amount,
    rf.refund_reason,
    rf.status
FROM Refunds  rf
JOIN Payments p  ON p.payment_id = rf.payment_id
JOIN Users    u  ON u.user_id    = p.guest_id;
GO