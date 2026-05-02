-- =============================================================================
-- REVIEW VIEWS
-- =============================================================================
 
-- -----------------------------------------------------------------------------
-- vw_HotelRatingSummary
-- Live aggregate per hotel: avg rating + per-star breakdown
-- -----------------------------------------------------------------------------
CREATE OR ALTER VIEW vw_HotelRatingSummary
AS
    SELECT
        rt.hotel_id,
        h.name                                          AS hotel_name,
        COUNT(rv.review_id)                             AS total_reviews,
        CAST(AVG(rv.overall_rating) AS DECIMAL(3, 2))  AS avg_rating,
        SUM(CASE WHEN FLOOR(rv.overall_rating) = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN FLOOR(rv.overall_rating) = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN FLOOR(rv.overall_rating) = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN FLOOR(rv.overall_rating) = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN FLOOR(rv.overall_rating) = 1 THEN 1 ELSE 0 END) AS one_star
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    GROUP BY rt.hotel_id, h.name;
GO
 
-- -----------------------------------------------------------------------------
-- vw_UnrespondedReviews
-- All reviews that have no host response yet.
-- Hosts/admins can query this to find reviews needing attention.
-- -----------------------------------------------------------------------------
CREATE OR ALTER VIEW vw_UnrespondedReviews
AS
    SELECT
        rv.review_id,
        rt.hotel_id,
        h.name          AS hotel_name,
        h.host_id,
        u.full_name     AS guest_name,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.created_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Users      u   ON u.user_id        = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE rv.host_response IS NULL;
GO