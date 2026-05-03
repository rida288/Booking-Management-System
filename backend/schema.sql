-- =============================================================================
-- SMART HOTEL BOOKING & RESERVATION MANAGEMENT SYSTEM
-- =============================================================================

-- =============================================================================
-- DATABASE
-- =============================================================================

CREATE DATABASE Booking_Management_System;
GO

USE Booking_Management_System;
GO


-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Users
-- Stores all system actors: guests, hosts, and admins.
-- -----------------------------------------------------------------------------
CREATE TABLE Users (
    user_id         UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    email           VARCHAR(255)        NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,
    full_name       VARCHAR(150)        NOT NULL,
    phone_number    VARCHAR(13)         NULL,
    role            VARCHAR(10)         NOT NULL    DEFAULT 'GUEST',
    is_active       BIT                 NOT NULL    DEFAULT 1,
    created_at      DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_users         PRIMARY KEY (user_id),
    CONSTRAINT UQ_user_email    UNIQUE      (email),
    CONSTRAINT UQ_user_phone    UNIQUE      (phone_number),
    CONSTRAINT CK_user_role     CHECK       (role IN ('GUEST', 'HOST', 'ADMIN'))
);
GO

-- -----------------------------------------------------------------------------
-- Hotels
-- A hotel property registered by a host.
-- -----------------------------------------------------------------------------
CREATE TABLE Hotels (
    hotel_id            UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    host_id             UNIQUEIDENTIFIER    NOT NULL,
    name                VARCHAR(255)        NOT NULL,
    description         VARCHAR(MAX)        NULL,
    address             VARCHAR(255)        NULL,
    city                VARCHAR(100)        NOT NULL,
    province            VARCHAR(100)        NULL,
    country             VARCHAR(100)        NOT NULL,
    star_rating         INT                 NULL,
    check_in_time       TIME                NOT NULL    DEFAULT '14:00:00',
    check_out_time      TIME                NOT NULL    DEFAULT '11:00:00',
    cancellation_policy VARCHAR(MAX)        NULL,
    created_at          DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_hotels             PRIMARY KEY (hotel_id),
    CONSTRAINT FK_hotels_host        FOREIGN KEY (host_id) REFERENCES Users (user_id)
                                     ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CK_hotels_star_rating CHECK (star_rating BETWEEN 1 AND 5)
);
GO

-- -----------------------------------------------------------------------------
-- Amenity
-- Master list of amenities that can be attached to hotels, room types,
-- or event spaces.
-- -----------------------------------------------------------------------------
CREATE TABLE Amenity (
    amenity_id  UNIQUEIDENTIFIER    NOT NULL,
    name        VARCHAR(100)        NOT NULL,
    description VARCHAR(MAX)        NULL,

    CONSTRAINT PK_amenity PRIMARY KEY (amenity_id)
);
GO

-- -----------------------------------------------------------------------------
-- Hotel_Amenities  (junction)
-- -----------------------------------------------------------------------------
CREATE TABLE Hotel_Amenities (
    hotel_id    UNIQUEIDENTIFIER    NOT NULL,
    amenity_id  UNIQUEIDENTIFIER    NOT NULL,

    CONSTRAINT PK_hotel_amenities          PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT FK_hotel_amenities_hotel    FOREIGN KEY (hotel_id) REFERENCES Hotels (hotel_id)
                                           ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_hotel_amenities_amenity  FOREIGN KEY (amenity_id) REFERENCES Amenity (amenity_id)
                                           ON DELETE CASCADE ON UPDATE NO ACTION
);
GO

-- -----------------------------------------------------------------------------
-- Room_Types
-- A category of rooms within a hotel (e.g. "Deluxe King").
-- is_available is toggled automatically by the defect triggers.
-- -----------------------------------------------------------------------------
CREATE TABLE Room_Types (
    room_type_id            UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    hotel_id                UNIQUEIDENTIFIER    NOT NULL,
    type_name               VARCHAR(100)        NOT NULL,
    description             VARCHAR(MAX)        NULL,
    max_occupancy           INT                 NOT NULL,
    total_rooms             INT                 NOT NULL,
    base_price_per_night    DECIMAL(12, 2)      NOT NULL,
    size_sqft               DECIMAL(8, 2)       NULL,
    bed_type                VARCHAR(50)         NULL,
    is_available            BIT                 NOT NULL    DEFAULT 1,
    created_at              DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    updated_at              DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_room_types                PRIMARY KEY (room_type_id),
    CONSTRAINT FK_room_types_hotel          FOREIGN KEY (hotel_id) REFERENCES Hotels (hotel_id)
                                            ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT UQ_room_types_hotel_name     UNIQUE      (hotel_id, type_name),
    CONSTRAINT CK_room_types_max_occupancy  CHECK       (max_occupancy > 0),
    CONSTRAINT CK_room_types_total_rooms    CHECK       (total_rooms > 0),
    CONSTRAINT CK_room_types_price          CHECK       (base_price_per_night >= 0)
);
GO

-- -----------------------------------------------------------------------------
-- Room_Type_Amenities  (junction)
-- -----------------------------------------------------------------------------
CREATE TABLE Room_Type_Amenities (
    room_type_id    UNIQUEIDENTIFIER    NOT NULL,
    amenity_id      UNIQUEIDENTIFIER    NOT NULL,

    CONSTRAINT PK_room_type_amenities       PRIMARY KEY (room_type_id, amenity_id),
    CONSTRAINT FK_room_type_amenities_rt    FOREIGN KEY (room_type_id) REFERENCES Room_Types (room_type_id)
                                            ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_room_type_amenities_am    FOREIGN KEY (amenity_id) REFERENCES Amenity (amenity_id)
                                            ON DELETE CASCADE ON UPDATE NO ACTION
);
GO

-- -----------------------------------------------------------------------------
-- Room_Defects
-- Defect reports filed against a room type. CRITICAL defects automatically
-- disable the room type via trigger.
-- -----------------------------------------------------------------------------
CREATE TABLE Room_Defects (
    defect_id       UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    room_type_id    UNIQUEIDENTIFIER    NOT NULL,
    reported_by     UNIQUEIDENTIFIER    NOT NULL,
    title           VARCHAR(255)        NOT NULL,
    description     VARCHAR(MAX)        NULL,
    severity        VARCHAR(10)         NOT NULL    DEFAULT 'MEDIUM',
    status          VARCHAR(15)         NOT NULL    DEFAULT 'OPEN',
    reported_at     DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    resolved_at     DATETIME2           NULL,

    CONSTRAINT PK_room_defects          PRIMARY KEY (defect_id),
    CONSTRAINT FK_room_defects_rt       FOREIGN KEY (room_type_id) REFERENCES Room_Types (room_type_id)
                                        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_room_defects_reporter FOREIGN KEY (reported_by) REFERENCES Users (user_id)
                                        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_room_defects_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT CK_room_defects_status   CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
);
GO

-- -----------------------------------------------------------------------------
-- Bookings
-- A room reservation made by a guest.
-- All three FKs use NO ACTION to avoid multi-path cascade errors.
-- -----------------------------------------------------------------------------
CREATE TABLE Bookings (
    booking_id              UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    guest_id                UNIQUEIDENTIFIER    NOT NULL,
    room_type_id            UNIQUEIDENTIFIER    NOT NULL,
    -- hotel_id                UNIQUEIDENTIFIER    NOT NULL, --> every room type id linked to a specific hotel 
    check_in_date           DATE                NOT NULL,
    check_out_date          DATE                NOT NULL,
    num_guests              INT                 NOT NULL,
    num_rooms               INT                 NOT NULL    DEFAULT 1,
    base_price_per_night    DECIMAL(12, 2)      NOT NULL,
    discount_percent        DECIMAL(5, 2)       NOT NULL    DEFAULT 0,
    -- total_amount            DECIMAL(12, 2)      NOT NULL, --> derivable attribute (was violating BCNF)
    status                  VARCHAR(15)         NOT NULL    DEFAULT 'PENDING',
    cancellation_reason     VARCHAR(MAX)        NULL,
    cancelled_at            DATETIME2           NULL,
    created_at              DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    updated_at              DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_bookings              PRIMARY KEY (booking_id),
    CONSTRAINT FK_bookings_guest        FOREIGN KEY (guest_id) REFERENCES Users (user_id)
                                        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT FK_bookings_room_type    FOREIGN KEY (room_type_id) REFERENCES Room_Types (room_type_id)
                                        ON DELETE NO ACTION ON UPDATE NO ACTION,
    --CONSTRAINT FK_bookings_hotel        FOREIGN KEY (hotel_id) REFERENCES Hotels (hotel_id)
    --                                    ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_bookings_dates        CHECK (check_out_date > check_in_date),
    CONSTRAINT CK_bookings_num_guests   CHECK (num_guests > 0),
    CONSTRAINT CK_bookings_num_rooms    CHECK (num_rooms > 0),
    -- CONSTRAINT CK_bookings_amount       CHECK (total_amount >= 0),
    CONSTRAINT CK_bookings_discount     CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT CK_bookings_status       CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'))
);
GO

-- -----------------------------------------------------------------------------
-- Payments
-- Financial transactions (charges and refunds) linked to bookings.
-- -----------------------------------------------------------------------------
CREATE TABLE Payments (
    payment_id      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    booking_id      UNIQUEIDENTIFIER    NOT NULL,
    guest_id        UNIQUEIDENTIFIER    NOT NULL,
    payment_type    VARCHAR(20)         NOT NULL,
    amount          DECIMAL(12, 2)      NOT NULL,
    payment_method  NVARCHAR(20)        NOT NULL,
    payment_gateway NVARCHAR(50)        NULL,
    status          NVARCHAR(25)        NOT NULL    DEFAULT 'PENDING',
    initiated_at    DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    completed_at    DATETIME2           NULL,

    CONSTRAINT PK_payments          PRIMARY KEY (payment_id),
    CONSTRAINT FK_payments_booking  FOREIGN KEY (booking_id) REFERENCES Bookings (booking_id)
                                    ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_payments_guest    FOREIGN KEY (guest_id) REFERENCES Users (user_id)
                                    ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_payments_type     CHECK (payment_type IN ('CHARGE', 'REFUND', 'PARTIAL_REFUND')),
    CONSTRAINT CK_payments_method   CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'WALLET', 'CASH')),
    CONSTRAINT CK_payments_status   CHECK (status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    CONSTRAINT CK_payments_amount   CHECK (amount > 0)
);
GO

-- -----------------------------------------------------------------------------
-- Refunds
-- Audit record for every refund, linked to the originating payment and booking.
-- -----------------------------------------------------------------------------
CREATE TABLE Refunds (
    refund_id       UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    payment_id      UNIQUEIDENTIFIER    NOT NULL,
    -- booking_id      UNIQUEIDENTIFIER    NOT NULL, --> every payment against a unique booking 
    refund_amount   DECIMAL(12, 2)      NOT NULL,
    refund_reason   VARCHAR(MAX)        NOT NULL,
    initiated_by    UNIQUEIDENTIFIER    NOT NULL,
    status          VARCHAR(15)         NOT NULL    DEFAULT 'PENDING',
    initiated_at    DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    completed_at    DATETIME2           NULL,

    CONSTRAINT PK_refunds           PRIMARY KEY (refund_id),
    CONSTRAINT FK_refunds_payment   FOREIGN KEY (payment_id) REFERENCES Payments (payment_id)
                                    ON DELETE CASCADE ON UPDATE NO ACTION,
    --CONSTRAINT FK_refunds_booking   FOREIGN KEY (booking_id) REFERENCES Bookings (booking_id)
    --                                ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT FK_refunds_initiator FOREIGN KEY (initiated_by) REFERENCES Users (user_id)
                                    ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_refunds_amount    CHECK (refund_amount > 0),
    CONSTRAINT CK_refunds_status    CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
);
GO

-- -----------------------------------------------------------------------------
-- Reviews
-- One review per booking (enforced by unique constraint on booking_id).
-- -----------------------------------------------------------------------------
CREATE TABLE Reviews (
    review_id           UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    booking_id          UNIQUEIDENTIFIER    NOT NULL,
    -- guest_id            UNIQUEIDENTIFIER    NOT NULL, --> both can be determined via booking id 
    -- hotel_id            UNIQUEIDENTIFIER    NOT NULL,
    -- room_type_id        UNIQUEIDENTIFIER    NULL, --> derivable via booking_id -> room_type_id
    overall_rating      DECIMAL(2, 1)       NOT NULL,
    title               VARCHAR(255)        NULL,
    body                VARCHAR(MAX)        NULL,
    host_response       VARCHAR(MAX)        NULL,
    host_responded_at   DATETIME2           NULL,
    created_at          DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_reviews               PRIMARY KEY (review_id),
    CONSTRAINT UQ_reviews_booking       UNIQUE      (booking_id),
    CONSTRAINT FK_reviews_booking       FOREIGN KEY (booking_id) REFERENCES Bookings (booking_id)
                                        ON DELETE CASCADE ON UPDATE NO ACTION,
    --CONSTRAINT FK_reviews_guest         FOREIGN KEY (guest_id) REFERENCES Users (user_id)
    --                                    ON DELETE NO ACTION ON UPDATE NO ACTION,
    --CONSTRAINT FK_reviews_hotel         FOREIGN KEY (hotel_id) REFERENCES Hotels (hotel_id)
    --                                    ON DELETE NO ACTION ON UPDATE NO ACTION,
    -- CONSTRAINT FK_reviews_room_type     FOREIGN KEY (room_type_id) REFERENCES Room_Types (room_type_id)
    --                                     ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_reviews_overall       CHECK (overall_rating BETWEEN 1.0 AND 5.0)
);
GO

-- -----------------------------------------------------------------------------
-- Event_Spaces
-- Bookable event venues (conference rooms, ballrooms, etc.) within a hotel.
-- -----------------------------------------------------------------------------
CREATE TABLE Event_Spaces (
    event_space_id          UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    hotel_id                UNIQUEIDENTIFIER    NOT NULL,
    name                    VARCHAR(255)        NOT NULL,
    space_type              VARCHAR(50)         NOT NULL,
    capacity                INT                 NOT NULL,
    hourly_rate             DECIMAL(10, 2)      NOT NULL,
    floor_number            INT                 NULL,
    setup_buffer_mins       INT                 NOT NULL    DEFAULT 0,
    teardown_buffer_mins    INT                 NOT NULL    DEFAULT 0,
    created_at              DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_event_spaces       PRIMARY KEY (event_space_id),
    CONSTRAINT FK_event_spaces_hotel FOREIGN KEY (hotel_id) REFERENCES Hotels (hotel_id)
                                     ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT CK_event_capacity     CHECK (capacity > 0)
);
GO

-- -----------------------------------------------------------------------------
-- Event_Space_Amenities  (junction)
-- -----------------------------------------------------------------------------
CREATE TABLE Event_Space_Amenities (
    event_space_id  UNIQUEIDENTIFIER    NOT NULL,
    amenity_id      UNIQUEIDENTIFIER    NOT NULL,

    CONSTRAINT PK_event_space_amenities PRIMARY KEY (event_space_id, amenity_id),
    CONSTRAINT FK_esa_space             FOREIGN KEY (event_space_id) REFERENCES Event_Spaces (event_space_id)
                                        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_esa_amenity           FOREIGN KEY (amenity_id) REFERENCES Amenity (amenity_id)
                                        ON DELETE CASCADE ON UPDATE NO ACTION
);
GO

-- -----------------------------------------------------------------------------
-- Event_Bookings
-- One-off event space reservations.
-- -----------------------------------------------------------------------------
CREATE TABLE Event_Bookings (
    booking_id      UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    event_space_id  UNIQUEIDENTIFIER    NOT NULL,
    guest_id        UNIQUEIDENTIFIER    NOT NULL,
    event_date      DATE                NOT NULL,
    start_time      TIME                NOT NULL,
    end_time        TIME                NOT NULL,
    status          VARCHAR(15)         NOT NULL    DEFAULT 'PENDING',
    created_at      DATETIME2           NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_event_bookings      PRIMARY KEY (booking_id),
    CONSTRAINT FK_event_booking_space FOREIGN KEY (event_space_id) REFERENCES Event_Spaces (event_space_id)
                                      ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_event_booking_guest FOREIGN KEY (guest_id) REFERENCES Users (user_id)
                                      ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT CK_event_time          CHECK (end_time > start_time)
);
GO

-- -----------------------------------------------------------------------------
-- Event_Booking_Series
-- Defines a recurring series (DAILY / WEEKLY / MONTHLY) for an event space.
-- -----------------------------------------------------------------------------
CREATE TABLE Event_Booking_Series (
    series_id           UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    event_space_id      UNIQUEIDENTIFIER    NOT NULL,
    guest_id            UNIQUEIDENTIFIER    NOT NULL,
    recurrence_type     VARCHAR(10)         NOT NULL,
    interval_val        INT                 NOT NULL    DEFAULT 1,
    start_date          DATE                NOT NULL,
    end_date            DATE                NULL,
    max_occurrences     INT                 NULL,
    start_time          TIME                NOT NULL,
    end_time            TIME                NOT NULL,

    CONSTRAINT PK_series       PRIMARY KEY (series_id),
    CONSTRAINT FK_series_space FOREIGN KEY (event_space_id) REFERENCES Event_Spaces (event_space_id)
                               ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT FK_series_guest FOREIGN KEY (guest_id) REFERENCES Users (user_id)
                               ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

-- -----------------------------------------------------------------------------
-- Event_Booking_Occurrences
-- Individual occurrence rows generated from a series.
-- -----------------------------------------------------------------------------
CREATE TABLE Event_Booking_Occurrences (
    occurrence_id   UNIQUEIDENTIFIER    NOT NULL    DEFAULT NEWSEQUENTIALID(),
    series_id       UNIQUEIDENTIFIER    NOT NULL,
    -- event_space_id  UNIQUEIDENTIFIER    NOT NULL, --> derivale via series id 
    event_date      DATE                NOT NULL,
    start_time      TIME                NOT NULL,
    end_time        TIME                NOT NULL,
    status          VARCHAR(15)         NOT NULL    DEFAULT 'CONFIRMED',

    CONSTRAINT PK_occurrence PRIMARY KEY (occurrence_id),
    CONSTRAINT FK_occ_series FOREIGN KEY (series_id) REFERENCES Event_Booking_Series (series_id)
                             ON DELETE CASCADE ON UPDATE NO ACTION
    -- CONSTRAINT FK_occ_space  FOREIGN KEY (event_space_id) REFERENCES Event_Spaces (event_space_id)
    --                          ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO

-- -----------------------------------------------------------------------------
-- Token Blacklist
-- Stores JWTs after logout until their natural expiry time.
-- -----------------------------------------------------------------------------
CREATE TABLE TokenBlacklist (
    blacklist_id   INT             NOT NULL    IDENTITY(1,1),
    token          VARCHAR(MAX)    NOT NULL,
    expires_at     DATETIME2       NOT NULL,
    blacklisted_at DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_token_blacklist PRIMARY KEY (blacklist_id),
    CONSTRAINT CK_token_blacklist_expiry CHECK (expires_at > blacklisted_at)
);
GO

----- INDEXING STRATEGIES -----
-- Hotels: searching by city/country is very common
CREATE INDEX IX_Hotels_City        ON Hotels (city);
CREATE INDEX IX_Hotels_Country     ON Hotels (country);
CREATE INDEX IX_Hotels_HostId      ON Hotels (host_id);

-- Room_Types: lookups by hotel are the most frequent query
CREATE INDEX IX_RoomTypes_HotelId  ON Room_Types (hotel_id);

-- Room_Defects: filtering by status and room type
CREATE INDEX IX_Defects_RoomTypeId ON Room_Defects (room_type_id);
CREATE INDEX IX_Defects_Status     ON Room_Defects (status);

-- Hotel_Amenities / Room_Type_Amenities: junction table lookups
CREATE INDEX IX_HotelAmenities_AmenityId    ON Hotel_Amenities (amenity_id);
CREATE INDEX IX_RoomTypeAmenities_AmenityId ON Room_Type_Amenities (amenity_id);
