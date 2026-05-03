-- =============================================================================
-- BOOKING PROCEDURES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- usp_CreateBooking
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_CreateBooking
    @guestId    UNIQUEIDENTIFIER,
    @roomTypeId UNIQUEIDENTIFIER,
    @checkIn    DATE,
    @checkOut   DATE,
    @numGuests  INT,
    @numRooms   INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            INSERT INTO Bookings
                (guest_id, room_type_id, check_in_date, check_out_date,
                 num_guests, num_rooms, base_price_per_night, discount_percent, status)
            SELECT
                @guestId, @roomTypeId, @checkIn, @checkOut,
                @numGuests, @numRooms, rt.base_price_per_night, 0, 'PENDING'
            FROM Room_Types rt
            WHERE rt.room_type_id = @roomTypeId
              AND rt.is_available  = 1;

            IF @@ROWCOUNT = 0
                THROW 50001, 'Room type is unavailable or does not exist.', 1;

            UPDATE Room_Types
            SET total_rooms = total_rooms - @numRooms
            WHERE room_type_id = @roomTypeId
            AND total_rooms   >= @numRooms;

            IF @@ROWCOUNT = 0
                THROW 50006, 'Insufficient rooms available for the requested quantity.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION; -- prevent orphaned transactions 
        THROW;
    END CATCH;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_ConfirmBooking
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_ConfirmBooking
    @bookingId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE Bookings
            SET status     = 'CONFIRMED',
                updated_at = SYSUTCDATETIME()
            WHERE booking_id = @bookingId
              AND status     = 'PENDING';

            IF @@ROWCOUNT = 0
                THROW 50002, 'No pending booking found to confirm.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_CompleteBooking
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_CompleteBooking
    @bookingId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE Bookings
            SET status     = 'COMPLETED',
                updated_at = SYSUTCDATETIME()
            WHERE booking_id = @bookingId
              AND status     = 'CONFIRMED';

            IF @@ROWCOUNT = 0
                THROW 50003, 'No confirmed booking found to complete.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_CancelBooking_Guest
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_CancelBooking_Guest
    @bookingId          UNIQUEIDENTIFIER,
    @guestId            UNIQUEIDENTIFIER,
    @cancellationReason VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE Bookings
            SET
                status              = 'CANCELLED',
                cancellation_reason = @cancellationReason,
                cancelled_at        = SYSUTCDATETIME(),
                updated_at          = SYSUTCDATETIME()
            WHERE booking_id = @bookingId
              AND guest_id   = @guestId
              AND status     IN ('PENDING', 'CONFIRMED');

            IF @@ROWCOUNT = 0
                THROW 50004, 'No cancellable booking found for this guest.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_CancelBooking_Admin
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_CancelBooking_Admin
    @bookingId          UNIQUEIDENTIFIER,
    @cancellationReason VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE Bookings
            SET
                status              = 'CANCELLED',
                cancellation_reason = @cancellationReason,
                cancelled_at        = SYSUTCDATETIME(),
                updated_at          = SYSUTCDATETIME()
            WHERE booking_id = @bookingId
              AND status     IN ('PENDING', 'CONFIRMED');

            IF @@ROWCOUNT = 0
                THROW 50005, 'No cancellable booking found.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetBooking_Guest
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBooking_Guest
    @bookingId  UNIQUEIDENTIFIER,
    @guestId    UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        h.city,
        h.country,
        rt.type_name,
        rt.bed_type,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        b.base_price_per_night,
        b.discount_percent,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2))  AS total_amount,
        b.status,
        b.cancellation_reason,
        b.cancelled_at,
        b.created_at
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE b.booking_id = @bookingId
      AND b.guest_id   = @guestId;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetBooking_Host
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBooking_Host
    @bookingId  UNIQUEIDENTIFIER,
    @hostId     UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        h.city,
        h.country,
        rt.type_name,
        rt.bed_type,
        u.full_name     AS guest_name,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        b.base_price_per_night,
        b.discount_percent,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2)) AS total_amount,
        b.status,
        b.cancellation_reason,
        b.cancelled_at,
        b.created_at
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    JOIN Users      u  ON u.user_id       = b.guest_id
    WHERE b.booking_id = @bookingId
      AND h.host_id    = @hostId;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetBooking_Admin
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBooking_Admin
    @bookingId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        rt.type_name,
        u.full_name     AS guest_name,
        u.email         AS guest_email,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        b.base_price_per_night,
        b.discount_percent,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2))  AS total_amount,
        b.status,
        b.cancellation_reason,
        b.cancelled_at,
        b.created_at
    FROM Bookings b
    JOIN Users      u  ON u.user_id       = b.guest_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE b.booking_id = @bookingId;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetBookingHistory_Guest
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBookingHistory_Guest
    @guestId    UNIQUEIDENTIFIER,
    @status     VARCHAR(15) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        rt.type_name    AS room_type,
        b.check_in_date,
        b.check_out_date,
        b.num_rooms,
        b.discount_percent,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2))  AS total_amount,
        b.status,
        b.cancellation_reason
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE b.guest_id = @guestId
      AND (@status IS NULL OR b.status = @status)
    ORDER BY b.check_in_date DESC;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetBookingHistory_Host
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBookingHistory_Host
    @hostId UNIQUEIDENTIFIER,
    @status VARCHAR(15) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        rt.type_name    AS room_type,
        u.full_name     AS guest_name,
        u.email         AS guest_email,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2))  AS total_amount,
        b.status
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    JOIN Users      u  ON u.user_id       = b.guest_id
    WHERE h.host_id = @hostId
    AND (@status IS NULL OR b.status = @status)
    ORDER BY b.check_in_date DESC;
END;
GO


-- -----------------------------------------------------------------------------
-- usp_GetBookingHistory_Admin
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetBookingHistory_Admin
    @status VARCHAR(15) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        b.booking_id,
        h.name          AS hotel_name,
        u.full_name     AS guest_name,
        rt.type_name,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        b.base_price_per_night,
        b.discount_percent,
        CAST(
            b.base_price_per_night
            * b.num_rooms
            * DATEDIFF(DAY, b.check_in_date, b.check_out_date)
            * (1.0 - b.discount_percent / 100.0)
        AS DECIMAL(12, 2)) AS total_amount,
        b.status,
        b.cancellation_reason,
        b.cancelled_at,
        b.created_at
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    JOIN Users      u  ON u.user_id       = b.guest_id
    WHERE (@status IS NULL OR b.status = @status)
    ORDER BY b.created_at DESC;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_PurgeOldBookings
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_PurgeOldBookings
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            DELETE FROM Bookings
            WHERE check_out_date < CAST(DATEADD(YEAR, -1, GETDATE()) AS DATE)
              AND status IN ('COMPLETED', 'CANCELLED');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
















-- Hotels 

-- creating hotels 
CREATE OR ALTER PROCEDURE usp_CreateHotel 
   @hostId UNIQUEIDENTIFIER,
   @name VARCHAR(255),
   @description VARCHAR(MAX) = NULL ,
   @address VARCHAR(255) = NULL,
    @city VARCHAR(100),
   @province VARCHAR(100),
   @country VARCHAR(100),
   @starRating INT =NULL,
   @checkInTime TIME ='14:00:00',
   @checkOutTime  TIME='11:00:00',
   @cancellationPolicy VARCHAR(MAX) = NULL

AS 
BEGIN 
    SET NOCOUNT ON;
    BEGIN TRY 
        BEGIN TRANSACTION;

            INSERT INTO Hotels
                (host_id, name, description, address, city,province ,  country, star_rating, check_in_time, check_out_time, cancellation_policy)
            VALUES
                (@hostId, @name, @description, @address, @city,@province , @country, @starRating, @checkInTime, @checkOutTime, @cancellationPolicy);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO


-- updating hotels
CREATE OR ALTER PROCEDURE usp_UpdateHotel 
    @hotelId UNIQUEIDENTIFIER,
    @name VARCHAR(255) = NULL,
    @description VARCHAR(MAX) = NULL,
    @address VARCHAR(255) = NULL,
    @city VARCHAR(100) = NULL,
    @province VARCHAR(100) = NULL,
    @country VARCHAR(100) = NULL,
    @starRating INT = NULL,
    @checkInTime TIME,
    @checkOutTime TIME,
    @cancellationPolicy VARCHAR(MAX) = NULL

AS 
BEGIN 
   SET NOCOUNT ON ;
   UPDATE Hotels 
   SET 
   name = @name , 
   description =@description ,
   address = @address ,
   city =@city , 
   province  = @province ,
   country = @country ,
   star_rating =@starRating ,
   check_in_time =@checkInTime, 
   check_out_time =@checkOutTime,
   cancellation_policy = @cancellationPolicy
   WHERE hotel_id  =@hotelId ;

   SELECT * 
   FROM Hotels 
   WHERE hotel_id = @hotelId ; 



END ;
GO


-- searching a hotel thru search query 

CREATE OR ALTER PROCEDURE usp_SearchHotel 
    @searchQuery VARCHAR(255)
AS 
BEGIN 
    SET NOCOUNT ON;
  
        SELECT 
            hotel_id, name,description,address,city,province,country,star_rating,check_in_time,check_out_time
        FROM Hotels
        WHERE name LIKE '%' + @searchQuery + '%'
           OR description LIKE '%' + @searchQuery + '%'
           OR city LIKE '%' + @searchQuery + '%'
           OR province LIKE '%' + @searchQuery + '%'
           OR country LIKE '%' + @searchQuery + '%';
 
    
END;
GO 


-- get hotel by id 

CREATE OR ALTER PROCEDURE usp_GetHotelById 
    @hotelId UNIQUEIDENTIFIER
AS 
BEGIN 
 SET NOCOUNT ON ;
    SELECT * 
    FROM Hotels 
    WHERE hotel_id = @hotelId ;

END ;
GO 

-- deleting a hotel using id

CREATE OR ALTER PROCEDURE usp_DeleteHotel 
    @hotelId UNIQUEIDENTIFIER
AS 
BEGIN 
  SET NOCOUNT ON ; 
  DELETE FROM Hotels 
  WHERE hotel_id = @hotelId ;

END;
GO 



-- Room Types

-- creating a room type
CREATE OR ALTER PROCEDURE usp_CreateRoomType
    @hotelId     UNIQUEIDENTIFIER,
    @typeName  VARCHAR(100),
    @description VARCHAR(MAX) = NULL,
    @maxOccupancy INT,
    @totalRooms  INT,
    @basePricePerNight DECIMAL(12, 2),
    @sizeSqft   DECIMAL(8, 2) = NULL,
    @bedType  VARCHAR(50) = NULL
AS
BEGIN 
    SET NOCOUNT ON ;
    BEGIN TRY 
        BEGIN TRANSACTION;

            INSERT INTO Room_Types
                (hotel_id, type_name, description, max_occupancy, total_rooms, base_price_per_night, size_sqft, bed_type)
            VALUES
                (@hotelId, @typeName, @description, @maxOccupancy, @totalRooms, @basePricePerNight, @sizeSqft, @bedType);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO



-- updating room type
CREATE OR ALTER PROCEDURE usp_UpdateRoomType
    @roomTypeId     UNIQUEIDENTIFIER,
    @typeName  VARCHAR(100),
    @description VARCHAR(MAX) = NULL,
    @maxOccupancy INT,
    @totalRooms  INT,
    @basePricePerNight DECIMAL(12, 2),
    @sizeSqft   DECIMAL(8, 2) = NULL,
    @bedType  VARCHAR(50) = NULL
AS 
BEGIN 
   SET NOCOUNT ON ;
   BEGIN TRY 
       UPDATE Room_Types
       SET
          type_name =@typeName , 
          description = @description , 
          max_occupancy = @maxOccupancy ,
          total_rooms = @totalRooms , 
          base_price_per_night = @basePricePerNight ,
          size_sqft = @sizeSqft , 
          bed_type = @bedType ,
          updated_at = SYSUTCDATETIME() 
        WHERE  room_type_id = @roomTypeId ;  

    IF @@ROWCOUNT = 0
        THROW 50006, 'No room type found to update.', 1;

    SELECT * 
    FROM Room_Types 
    WHERE room_type_id = @roomTypeId ;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- getting room type by id
CREATE OR ALTER PROCEDURE usp_GetRoomTypeById
    @roomTypeId UNIQUEIDENTIFIER
AS 
BEGIN 
    SET NOCOUNT ON;

    SELECT *
    FROM Room_Types
    WHERE room_type_id = @roomTypeId;

END;
GO 
-- getting  room types by hotel id
CREATE OR ALTER PROCEDURE usp_GetRoomTypesByHotelId
    @hotelId UNIQUEIDENTIFIER
AS 
BEGIN 
    SET NOCOUNT ON;

    SELECT *
    FROM Room_Types
    WHERE hotel_id = @hotelId;

END;
GO 


-- checking room type availability 
CREATE OR ALTER PROCEDURE usp_GetRoomAvailability 
    @roomTypeId UNIQUEIDENTIFIER,
    @checkIn DATE,
    @checkOut DATE
AS 
BEGIN  
    SET NOCOUNT ON;
    SELECT rt.room_type_id,rt.total_rooms,ISNULL(SUM(b.num_rooms), 0) AS booked_rooms, rt.total_rooms - ISNULL(SUM(b.num_rooms), 0) AS available_rooms
    FROM Room_Types rt LEFT JOIN Bookings b ON b.room_type_id = rt.room_type_id
       AND b.status IN ('PENDING', 'CONFIRMED')
       AND b.check_in_date < @checkOut
       AND b.check_out_date > @checkIn
    WHERE rt.room_type_id = @roomTypeId
    GROUP BY rt.room_type_id, rt.total_rooms;
END;
GO




-- Deleting a room type using id
CREATE OR ALTER PROCEDURE usp_DeleteRoomType
    @roomTypeId UNIQUEIDENTIFIER
AS 
BEGIN 
    SET NOCOUNT ON;
    BEGIN TRY 
        BEGIN TRANSACTION;

            DELETE FROM Room_Types
            WHERE room_type_id = @roomTypeId;

            IF @@ROWCOUNT = 0
                THROW 50007, 'No room type found to delete.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- Defects


-- creating a defect
CREATE OR ALTER PROCEDURE usp_CreateDefect
    @roomTypeId UNIQUEIDENTIFIER,
    @reportedBy  UNIQUEIDENTIFIER,
    @title     VARCHAR(255),
    @description VARCHAR(MAX) = NULL,
    @severity   VARCHAR(10) = 'MEDIUM'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
            INSERT INTO Room_Defects (room_type_id, reported_by, title, description, severity, status)
            VALUES (@roomTypeId, @reportedBy, @title, @description, @severity, 'OPEN');

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- getting active defects
CREATE OR ALTER PROCEDURE usp_GetActiveDefects
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Room_Defects
    WHERE status IN ('OPEN', 'IN_PROGRESS')
    ORDER BY reported_at DESC;
END;
GO

-- getting active defects by host id
CREATE OR ALTER PROCEDURE usp_GetActiveDefectsByHost
    @hostId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT d.*
    FROM Room_Defects d JOIN Room_Types rt ON d.room_type_id = rt.room_type_id
                        JOIN Hotels h ON rt.hotel_id = h.hotel_id
    WHERE h.host_id = @hostId AND d.status IN ('OPEN', 'IN_PROGRESS')
    ORDER BY d.reported_at DESC;
END;
GO

-- getting defect by id
CREATE OR ALTER PROCEDURE usp_GetDefectById
    @defectId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Room_Defects
    WHERE defect_id = @defectId;
END;
GO

-- updating the status of a defect
CREATE OR ALTER PROCEDURE usp_UpdateDefectStatus
    @defectId UNIQUEIDENTIFIER,
    @status   VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
            UPDATE Room_Defects
            SET
                status = @status,
                resolved_at = CASE
                    WHEN @status = 'RESOLVED' THEN SYSUTCDATETIME()
                    ELSE NULL
                END
            WHERE defect_id = @defectId;

            IF @@ROWCOUNT = 0
                THROW 50031, 'Defect not found.', 1;

            SELECT *
            FROM Room_Defects
            WHERE defect_id = @defectId;


    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
         ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO









-- =============================================================================
-- REVIEW PROCEDURES
-- =============================================================================
 
-- -----------------------------------------------------------------------------
-- usp_SubmitReview
-- Guest submits a review for a COMPLETED booking.
-- One review per booking enforced by UQ_reviews_booking.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_SubmitReview
    @bookingId      UNIQUEIDENTIFIER,
    @guestId        UNIQUEIDENTIFIER,
    @overallRating  DECIMAL(2, 1),
    @title          VARCHAR(255)    = NULL,
    @body           VARCHAR(MAX)    = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
            -- Guard: booking must be COMPLETED and owned by this guest
            IF NOT EXISTS (
                SELECT 1
                FROM   Bookings
                WHERE  booking_id = @bookingId
                  AND  guest_id   = @guestId
                  AND  status     = 'COMPLETED'
            )
                THROW 50010, 'Review not allowed: booking not found, not completed, or guest mismatch.', 1;
 
            INSERT INTO Reviews
                (booking_id, overall_rating, title, body)
            VALUES
                (@bookingId, @overallRating, @title, @body);
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_EditReview
-- Guest edits their own review within a 30-day window.
-- NULL params to leave the existing value unchanged.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_EditReview
    @reviewId       UNIQUEIDENTIFIER,
    @guestId        UNIQUEIDENTIFIER,
    @overallRating  DECIMAL(2, 1)   = NULL,
    @title          VARCHAR(255)    = NULL,
    @body           VARCHAR(MAX)    = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
            UPDATE r
            SET
                overall_rating  = ISNULL(@overallRating, r.overall_rating),
                title           = ISNULL(@title,         r.title),
                body            = ISNULL(@body,          r.body),
                updated_at      = SYSUTCDATETIME()
            FROM Reviews r
            JOIN Bookings b ON b.booking_id = r.booking_id
            WHERE r.review_id = @reviewId
              AND b.guest_id  = @guestId
              AND DATEDIFF(DAY, r.created_at, SYSUTCDATETIME()) <= 30;
 
            IF @@ROWCOUNT = 0
                THROW 50011, 'Edit not allowed: review not found, guest mismatch, or 30-day window expired.', 1;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_DeleteReview
-- Guest deletes their own review. Admin can delete any review.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_DeleteReview
    @reviewId       UNIQUEIDENTIFIER,
    @requesterId    UNIQUEIDENTIFIER,
    @isAdmin        BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
            IF @isAdmin = 1
            BEGIN
                DELETE FROM Reviews WHERE review_id = @reviewId;
            END
            ELSE
            BEGIN
                DELETE r
                FROM   Reviews  r
                JOIN   Bookings b ON b.booking_id = r.booking_id
                WHERE  r.review_id = @reviewId
                  AND  b.guest_id  = @requesterId;
            END
 
            IF @@ROWCOUNT = 0
                THROW 50012, 'Review not found or permission denied.', 1;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_RespondToReview
-- Host posts a public response to a review on one of their properties.
-- Ownership verified by joining through Bookings -> Room_Types -> Hotels.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_RespondToReview
    @reviewId       UNIQUEIDENTIFIER,
    @hostId         UNIQUEIDENTIFIER,
    @hostResponse   VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
 
            UPDATE rv
            SET
                host_response       = @hostResponse,
                host_responded_at   = SYSUTCDATETIME(),
                updated_at          = SYSUTCDATETIME()
            FROM Reviews    rv
            JOIN Bookings   b   ON b.booking_id     = rv.booking_id
            JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
            JOIN Hotels     h   ON h.hotel_id        = rt.hotel_id
            WHERE rv.review_id = @reviewId
              AND h.host_id    = @hostId;
 
            IF @@ROWCOUNT = 0
                THROW 50013, 'Response not allowed: review not found or hotel ownership mismatch.', 1;
 
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetReview
-- Fetch a single review with all derived context joined in.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetReview
    @reviewId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        rv.booking_id,
        u.full_name         AS guest_name,
        h.name              AS hotel_name,
        h.city,
        h.country,
        rt.type_name        AS room_type,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.host_response,
        rv.host_responded_at,
        rv.created_at,
        rv.updated_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Users      u   ON u.user_id        = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE rv.review_id = @reviewId;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetHotelReviews
-- All reviews for a hotel, paginated, newest first.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetHotelReviews
    @hotelId    UNIQUEIDENTIFIER,
    @pageSize   INT = 10,
    @pageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        u.full_name         AS guest_name,
        rt.type_name        AS room_type,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.host_response,
        rv.host_responded_at,
        rv.created_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Users      u   ON u.user_id        = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE h.hotel_id = @hotelId
    ORDER BY rv.created_at DESC
    OFFSET  (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetReviewSummary
-- Aggregate rating stats for a single hotel.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetReviewSummary
    @hotelId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
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
    WHERE rt.hotel_id = @hotelId;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetReviewHistory_Guest
-- All reviews written by a specific guest.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetReviewHistory_Guest
    @guestId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        h.name          AS hotel_name,
        rt.type_name    AS room_type,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.host_response,
        rv.created_at,
        rv.updated_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE b.guest_id = @guestId
    ORDER BY rv.created_at DESC;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetReviewHistory_Host
-- All reviews across a host's properties.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetReviewHistory_Host
    @hostId     UNIQUEIDENTIFIER,
    @hotelId    UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        h.name          AS hotel_name,
        u.full_name     AS guest_name,
        rt.type_name    AS room_type,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.host_response,
        rv.host_responded_at,
        rv.created_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Users      u   ON u.user_id        = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE h.host_id = @hostId
      AND (@hotelId IS NULL OR h.hotel_id = @hotelId) -- may or may not use hotel id to filter 
    ORDER BY rv.created_at DESC;
END;
GO
 
-- -----------------------------------------------------------------------------
-- usp_GetReviewHistory_Admin
-- All reviews system-wide with optional filters.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetReviewHistory_Admin
    @hotelId    UNIQUEIDENTIFIER = NULL,
    @guestId    UNIQUEIDENTIFIER = NULL,
    @minRating  DECIMAL(2, 1)   = NULL,
    @maxRating  DECIMAL(2, 1)   = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        rv.booking_id,
        h.name          AS hotel_name,
        u.full_name     AS guest_name,
        u.email         AS guest_email,
        rt.type_name    AS room_type,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.host_response,
        rv.host_responded_at,
        rv.created_at,
        rv.updated_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id     = rv.booking_id
    JOIN Users      u   ON u.user_id        = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id  = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id       = rt.hotel_id
    WHERE (@hotelId   IS NULL OR h.hotel_id         = @hotelId)
      AND (@guestId   IS NULL OR b.guest_id          = @guestId)
      AND (@minRating IS NULL OR rv.overall_rating   >= @minRating)
      AND (@maxRating IS NULL OR rv.overall_rating   <= @maxRating)
    ORDER BY rv.created_at DESC;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetUnrespondedReviews
-- Returns all reviews with no host response yet.
-- HOST: pass @hostId to get only their properties.
-- ADMIN: pass NULL to get all unresponded reviews system-wide.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetUnrespondedReviews
    @hostId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        rv.review_id,
        h.hotel_id,
        h.name          AS hotel_name,
        h.host_id,
        u.full_name     AS guest_name,
        rv.overall_rating,
        rv.title,
        rv.body,
        rv.created_at
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id    = rv.booking_id
    JOIN Users      u   ON u.user_id       = b.guest_id
    JOIN Room_Types rt  ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id      = rt.hotel_id
    WHERE rv.host_response IS NULL
      AND (@hostId IS NULL OR h.host_id = @hostId)
    ORDER BY rv.created_at ASC;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetTopRatedHotels
-- Returns top rated hotels with a minimum number of reviews.
-- ADMIN only.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetTopRatedHotels
    @minReviews INT = 5,
    @limit      INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@limit)
        h.hotel_id,
        h.name                                          AS hotel_name,
        h.city,
        h.country,
        h.star_rating,
        COUNT(rv.review_id)                             AS total_reviews,
        CAST(AVG(rv.overall_rating) AS DECIMAL(3, 2))  AS avg_rating
    FROM Reviews    rv
    JOIN Bookings   b   ON b.booking_id    = rv.booking_id
    JOIN Room_Types rt  ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h   ON h.hotel_id      = rt.hotel_id
    GROUP BY h.hotel_id, h.name, h.city, h.country, h.star_rating
    HAVING COUNT(rv.review_id) >= @minReviews
    ORDER BY avg_rating DESC;
END;
GO




-- =============================================================================
-- PAYMENT PROCEDURES
-- =============================================================================

CREATE OR ALTER PROCEDURE usp_ProcessPayment
    @bookingId      UNIQUEIDENTIFIER,
    @guestId        UNIQUEIDENTIFIER,
    @amount         DECIMAL(12, 2),
    @paymentMethod  NVARCHAR(20),
    @gateway        NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO Payments
            (booking_id, guest_id, payment_type, amount, payment_method, payment_gateway, status, initiated_at)
        VALUES
            (@bookingId, @guestId, 'CHARGE', @amount, @paymentMethod, @gateway, 'SUCCESSFUL', SYSUTCDATETIME());

        -- Update booking status to CONFIRMED after successful payment
        UPDATE Bookings
        SET status = 'CONFIRMED'
        WHERE booking_id = @bookingId
          AND guest_id = @guestId
          AND status = 'PENDING';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE usp_UpdatePaymentStatus
    @paymentId  UNIQUEIDENTIFIER,
    @status     NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE Payments
            SET status = @status, completed_at = SYSUTCDATETIME()
            WHERE payment_id = @paymentId;

            IF @@ROWCOUNT = 0
                THROW 50003, 'Payment not found.', 1;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetPaymentStatus_Guest
    @bookingId  UNIQUEIDENTIFIER,
    @guestId    UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id, p.payment_type, p.amount, p.payment_method,
        p.payment_gateway, p.status, p.initiated_at, p.completed_at
    FROM Payments p
    JOIN Bookings b ON b.booking_id = p.booking_id
    WHERE p.guest_id   = @guestId
      AND p.booking_id = @bookingId;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetFailedPayments_Admin
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id, p.booking_id, u.full_name, u.email,
        p.amount, p.payment_method, p.payment_gateway, p.status, p.initiated_at
    FROM Payments p
    JOIN Users u ON u.user_id = p.guest_id
    WHERE p.status = 'FAILED'
    ORDER BY p.initiated_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetPaymentHistory_Guest
    @guestId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id,
        h.name          AS hotel_name,
        b.check_in_date,
        b.check_out_date,
        p.payment_type,
        p.amount,
        p.payment_method,
        p.payment_gateway,
        p.status,
        p.initiated_at,
        p.completed_at
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE p.guest_id = @guestId
    AND p.payment_type = 'CHARGE'
    ORDER BY p.initiated_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetPaymentHistory_Host
    @hostId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id,
        p.booking_id,
        u.full_name,
        u.email,
        p.amount,
        p.payment_method,
        p.payment_gateway,
        p.status,
        p.initiated_at
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    JOIN Users      u  ON u.user_id       = p.guest_id
    WHERE h.host_id = @hostId
    AND p.payment_type = 'CHARGE'
    ORDER BY p.initiated_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetPaymentHistory_Admin
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id,
        p.booking_id,
        u.full_name     AS guest_name,
        h.name          AS hotel_name,
        p.payment_type,
        p.amount,
        p.payment_method,
        p.payment_gateway,
        p.status        AS payment_status,
        p.initiated_at,
        p.completed_at,
        r.refund_id,
        r.refund_amount,
        r.refund_reason,
        r.status        AS refund_status,
        r.completed_at  AS refund_completed_at
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    JOIN Users      u  ON u.user_id       = p.guest_id
    LEFT JOIN Payments pr ON pr.booking_id = p.booking_id 
                          AND pr.payment_type = 'REFUND'
    LEFT JOIN Refunds r  ON r.payment_id  = pr.payment_id
    WHERE p.payment_type = 'CHARGE'
    ORDER BY p.initiated_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetAuditTrail
    @bookingId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.payment_id, p.payment_type, p.amount, p.payment_method, p.payment_gateway,
        p.status        AS payment_status,
        p.initiated_at,
        p.completed_at,
        r.refund_id,
        r.refund_amount,
        r.refund_reason,
        r.status        AS refund_status,
        ri.full_name    AS refund_initiated_by
    FROM Payments p
    LEFT JOIN Refunds r  ON r.payment_id = p.payment_id
    LEFT JOIN Users   ri ON ri.user_id   = r.initiated_by
    WHERE p.booking_id = @bookingId
    ORDER BY p.initiated_at ASC;
END;
GO



-- Amenities

--getting all amenities 
CREATE OR ALTER PROCEDURE usp_GetAllAmenities
AS
BEGIN 
    SET NOCOUNT ON ;
    SELECT * 
    FROM Amenity ;
END;
GO

-- getting amenity by amenity id
CREATE OR ALTER PROCEDURE usp_GetAmenityById
    @amenityId UNIQUEIDENTIFIER
AS
BEGIN 
    SET NOCOUNT ON ;
    SELECT * 
    FROM Amenity 
    WHERE amenity_id = @amenityId ;
END;
GO

CREATE OR ALTER PROCEDURE usp_CreateAmenity
    @name VARCHAR(100)
AS 
BEGIN 
    SET NOCOUNT ON;
    BEGIN TRY 
        BEGIN TRANSACTION;

        INSERT INTO Amenity (amenity_id, name)
        VALUES (NEWID(), @name);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetAmenitiesByHotelId
    @hotelId UNIQUEIDENTIFIER  
AS 
BEGIN 
    SET NOCOUNT ON;
    SELECT a.amenity_id, a.name
    FROM Amenity a
    JOIN Hotel_Amenities ha ON ha.amenity_id = a.amenity_id
    WHERE ha.hotel_id = @hotelId;
END;
GO

CREATE OR ALTER PROCEDURE usp_GetAmenitiesByRoomTypeId
    @roomTypeId UNIQUEIDENTIFIER
AS 
BEGIN 
    SET NOCOUNT ON;
    SELECT a.amenity_id, a.name
    FROM Amenity a
    JOIN Room_Type_Amenities rta ON rta.amenity_id = a.amenity_id
    WHERE rta.room_type_id = @roomTypeId;
END;
GO

-- adding an amenity to a hotel
CREATE OR ALTER PROCEDURE usp_AddAmenityToHotel
    @hotelId UNIQUEIDENTIFIER,
    @amenityId UNIQUEIDENTIFIER

AS 
BEGIN 
    SET NOCOUNT ON ;
    BEGIN TRY 
        BEGIN TRANSACTION;

            INSERT INTO Hotel_Amenities
                (hotel_id, amenity_id)
            VALUES
                (@hotelId, @amenityId);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO


-- adding an amenity to a room type
CREATE OR ALTER PROCEDURE usp_AddAmenityToRoomType
    @roomTypeId UNIQUEIDENTIFIER,
    @amenityId UNIQUEIDENTIFIER
AS 
BEGIN 
    SET NOCOUNT ON ;
    BEGIN TRY 
        BEGIN TRANSACTION;

            INSERT INTO Room_Type_Amenities
                (room_type_id, amenity_id)
            VALUES
                (@roomTypeId, @amenityId);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO


-- removing an amenity from a hotel
CREATE OR ALTER PROCEDURE usp_RemoveAmenityFromHotel
    @hotelId UNIQUEIDENTIFIER,
    @amenityId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            DELETE FROM Hotel_Amenities
            WHERE hotel_id = @hotelId AND amenity_id = @amenityId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- removing an amenity from a room type
CREATE OR ALTER PROCEDURE usp_RemoveAmenityFromRoomType
    @roomTypeId UNIQUEIDENTIFIER,
    @amenityId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

            DELETE FROM Room_Type_Amenities
            WHERE room_type_id = @roomTypeId AND amenity_id = @amenityId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- =============================================================================
-- DASHBOARD PROCEDURES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- usp_GetAdminDashboard
-- Returns all stats needed for the admin dashboard in one call
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetAdminDashboard
AS
BEGIN
    SET NOCOUNT ON;

    -- Total revenue (all successful charges)
    SELECT
        CAST(ISNULL(SUM(p.amount), 0) AS DECIMAL(12, 2)) AS total_revenue
    FROM Payments p
    WHERE p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL';

    -- Revenue this month
    SELECT
        CAST(ISNULL(SUM(p.amount), 0) AS DECIMAL(12, 2)) AS revenue_this_month
    FROM Payments p
    WHERE p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
      AND MONTH(p.initiated_at) = MONTH(SYSUTCDATETIME())
      AND YEAR(p.initiated_at)  = YEAR(SYSUTCDATETIME());

    -- Bookings by status
    SELECT
        b.status,
        COUNT(*) AS total
    FROM Bookings b
    GROUP BY b.status
    ORDER BY total DESC;

    -- Revenue by month (last 6 months)
    SELECT
        FORMAT(p.initiated_at, 'MMM yyyy')          AS month,
        CAST(SUM(p.amount) AS DECIMAL(12, 2))        AS revenue,
        YEAR(p.initiated_at)                         AS yr,
        MONTH(p.initiated_at)                        AS mn
    FROM Payments p
    WHERE p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
      AND p.initiated_at >= DATEADD(MONTH, -6, SYSUTCDATETIME())
    GROUP BY FORMAT(p.initiated_at, 'MMM yyyy'), YEAR(p.initiated_at), MONTH(p.initiated_at)
    ORDER BY yr, mn;

    -- Top 3 hotels by revenue
    SELECT TOP 3
        h.name                                          AS hotel_name,
        h.city,
        CAST(SUM(p.amount) AS DECIMAL(12, 2))           AS total_revenue,
        COUNT(DISTINCT b.booking_id)                    AS total_bookings
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
    GROUP BY h.hotel_id, h.name, h.city
    ORDER BY total_revenue DESC;

    -- Pending and failed payment counts
    SELECT
        COUNT(CASE WHEN p.status = 'PENDING'  AND p.payment_type = 'CHARGE' THEN 1 END) AS pending_payments,
        COUNT(CASE WHEN p.status = 'FAILED'                                  THEN 1 END) AS failed_payments,
        COUNT(CASE WHEN p.status = 'PENDING'  AND p.payment_type = 'REFUND' THEN 1 END) AS pending_refunds
    FROM Payments p;
END;
GO

-- -----------------------------------------------------------------------------
-- usp_GetHostDashboard
-- Returns all stats needed for the host dashboard
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE usp_GetHostDashboard
    @hostId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Total revenue from host properties
    SELECT
        CAST(ISNULL(SUM(p.amount), 0) AS DECIMAL(12, 2)) AS total_revenue
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id      = @hostId
      AND p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL';

    -- Revenue this month
    SELECT
        CAST(ISNULL(SUM(p.amount), 0) AS DECIMAL(12, 2)) AS revenue_this_month
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id      = @hostId
      AND p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
      AND MONTH(p.initiated_at) = MONTH(SYSUTCDATETIME())
      AND YEAR(p.initiated_at)  = YEAR(SYSUTCDATETIME());

    -- Bookings by status for host properties
    SELECT
        b.status,
        COUNT(*) AS total
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id = @hostId
    GROUP BY b.status
    ORDER BY total DESC;

    -- Occupancy rate per room type
    SELECT
        rt.type_name,
        rt.total_rooms,
        COUNT(CASE WHEN b.status IN ('PENDING', 'CONFIRMED') THEN 1 END) AS active_bookings,
        CAST(
            COUNT(CASE WHEN b.status IN ('PENDING', 'CONFIRMED') THEN 1 END) * 100.0
            / NULLIF(rt.total_rooms, 0)
        AS DECIMAL(5, 2)) AS occupancy_rate
    FROM Room_Types rt
    JOIN Hotels h ON h.hotel_id = rt.hotel_id
    LEFT JOIN Bookings b ON b.room_type_id = rt.room_type_id
        AND b.check_in_date  <= CAST(SYSUTCDATETIME() AS DATE)
        AND b.check_out_date >= CAST(SYSUTCDATETIME() AS DATE)
    WHERE h.host_id = @hostId
    GROUP BY rt.room_type_id, rt.type_name, rt.total_rooms
    ORDER BY occupancy_rate DESC;

    -- Pending bookings count
    SELECT
        COUNT(*) AS pending_bookings
    FROM Bookings b
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id  = @hostId
      AND b.status   = 'PENDING';

    -- Unresponded reviews count
    SELECT
        COUNT(*) AS unresponded_reviews
    FROM Reviews rv
    JOIN Bookings   b  ON b.booking_id    = rv.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id          = @hostId
      AND rv.host_response   IS NULL;

    -- Revenue by month last 6 months
    SELECT
        FORMAT(p.initiated_at, 'MMM yyyy')          AS month,
        CAST(SUM(p.amount) AS DECIMAL(12, 2))        AS revenue,
        YEAR(p.initiated_at)                         AS yr,
        MONTH(p.initiated_at)                        AS mn
    FROM Payments p
    JOIN Bookings   b  ON b.booking_id    = p.booking_id
    JOIN Room_Types rt ON rt.room_type_id = b.room_type_id
    JOIN Hotels     h  ON h.hotel_id      = rt.hotel_id
    WHERE h.host_id      = @hostId
      AND p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
      AND p.initiated_at >= DATEADD(MONTH, -6, SYSUTCDATETIME())
    GROUP BY FORMAT(p.initiated_at, 'MMM yyyy'), YEAR(p.initiated_at), MONTH(p.initiated_at)
    ORDER BY yr, mn;
END;
GO
