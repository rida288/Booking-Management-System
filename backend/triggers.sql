-- -----------------------------------------------------------------------------
-- Bookings
-- -----------------------------------------------------------------------------

-- =============================================================================
-- TRIGGER: trg_AutoRefund
-- =============================================================================
CREATE OR ALTER TRIGGER trg_AutoRefund
ON Bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Only fire on status change to CANCELLED
    IF NOT EXISTS (
        SELECT 1
        FROM inserted i
        JOIN deleted d ON i.booking_id = d.booking_id
        WHERE i.status = 'CANCELLED'
          AND d.status <> 'CANCELLED'
    )
    RETURN;

    -- Only proceed if a successful CHARGE payment exists
    IF NOT EXISTS (
        SELECT 1
        FROM Payments p
        JOIN inserted i ON i.booking_id = p.booking_id
        WHERE p.payment_type = 'CHARGE'
          AND p.status = 'SUCCESSFUL'
    )
    RETURN;

    -- Only proceed if no refund already exists (prevent duplicates)
    IF EXISTS (
        SELECT 1
        FROM Payments p
        JOIN inserted i ON i.booking_id = p.booking_id
        WHERE p.payment_type = 'REFUND'
    )
    RETURN;

    -- Insert REFUND payment record (use original payment method)
    INSERT INTO Payments (
        booking_id,
        guest_id,
        payment_type,
        amount,
        payment_method,
        status
    )
    SELECT
        i.booking_id,
        i.guest_id,
        'REFUND',
        CAST(
            i.base_price_per_night
            * i.num_rooms
            * DATEDIFF(DAY, i.check_in_date, i.check_out_date)
            * (1.0 - i.discount_percent / 100.0)
        AS DECIMAL(12, 2)),
        p_orig.payment_method,  -- pull from original charge
        'PENDING'
    FROM inserted i
    JOIN deleted d      ON i.booking_id = d.booking_id
    JOIN Payments p_orig ON p_orig.booking_id = i.booking_id
                        AND p_orig.payment_type = 'CHARGE'
                        AND p_orig.status = 'SUCCESSFUL'
    WHERE i.status = 'CANCELLED'
      AND d.status <> 'CANCELLED';

    -- Insert Refunds audit record
    INSERT INTO Refunds (
        payment_id,
        refund_amount,
        refund_reason,
        initiated_by,
        initiated_at,
        status
    )
    SELECT
        p.payment_id,
        CAST(
            i.base_price_per_night
            * i.num_rooms
            * DATEDIFF(DAY, i.check_in_date, i.check_out_date)
            * (1.0 - i.discount_percent / 100.0)
        AS DECIMAL(12, 2)),
        ISNULL(i.cancellation_reason, 'Guest Cancelled'),
        i.guest_id,
        SYSUTCDATETIME(),
        'PENDING'
    FROM inserted i
    JOIN deleted d ON i.booking_id = d.booking_id
    JOIN Payments p ON p.payment_id = (
        SELECT TOP 1 payment_id
        FROM Payments
        WHERE booking_id = i.booking_id
          AND payment_type = 'REFUND'
          AND status = 'PENDING'
        ORDER BY initiated_at DESC
    )
    WHERE i.status = 'CANCELLED'
      AND d.status <> 'CANCELLED';

    -- Mark original CHARGE as REFUNDED
    UPDATE p
    SET
        status       = 'REFUNDED',
        completed_at = SYSUTCDATETIME()
    FROM Payments p
    JOIN inserted i ON i.booking_id = p.booking_id
    JOIN deleted d  ON i.booking_id = d.booking_id
    WHERE p.payment_type = 'CHARGE'
      AND p.status       = 'SUCCESSFUL'
      AND i.status       = 'CANCELLED'
      AND d.status      <> 'CANCELLED';

END;
GO


-- =============================================================================
-- TRIGGER: trg_OccupancyDiscount
-- =============================================================================
CREATE OR ALTER TRIGGER trg_OccupancyDiscount
ON Bookings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE b
    SET
        discount_percent = 10, -- set default 10 
        updated_at       = SYSUTCDATETIME()
    FROM Bookings b
    JOIN inserted i ON i.booking_id = b.booking_id
    WHERE b.discount_percent = 0  -- don't overwrite existing discount
      AND (
        SELECT SUM(b2.num_rooms) * 1.0 / NULLIF(SUM(rt.total_rooms), 0)
        FROM Room_Types rt
        LEFT JOIN Bookings b2 ON b2.room_type_id = rt.room_type_id -- left join since we want all rooms 
            AND b2.status IN ('PENDING', 'CONFIRMED')
            AND b2.booking_id <> i.booking_id  -- exclude the new booking
            AND b2.check_in_date  < i.check_out_date
            AND b2.check_out_date > i.check_in_date
        WHERE rt.hotel_id = (
            SELECT hotel_id FROM Room_Types WHERE room_type_id = i.room_type_id
        )
    ) < 0.90;

END;
GO