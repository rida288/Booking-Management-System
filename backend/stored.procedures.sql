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
        h.name      AS hotel_name,
        rt.type_name,
        u.full_name AS guest_name,
        b.check_in_date,
        b.check_out_date,
        b.num_guests,
        b.num_rooms,
        b.discount_percent,
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
    @hostId UNIQUEIDENTIFIER
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
    ORDER BY b.check_in_date DESC;
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
    LEFT JOIN Refunds r ON r.payment_id   = p.payment_id
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