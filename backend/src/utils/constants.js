// roles 

// booking status 

// payment status 

// defect severity

// mirrors sql check constraints for consistency 

const ROLES = {
    GUEST: 'GUEST',
    HOST:  'HOST',
    ADMIN: 'ADMIN'
};

const BOOKING_STATUS = {
    PENDING:   'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    NO_SHOW:   'NO_SHOW'
};

const PAYMENT_TYPE = {
    CHARGE:         'CHARGE',
    REFUND:         'REFUND',
    PARTIAL_REFUND: 'PARTIAL_REFUND'
};

const PAYMENT_METHOD = {
    CREDIT_CARD:   'CREDIT_CARD',
    DEBIT_CARD:    'DEBIT_CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    WALLET:        'WALLET',
    CASH:          'CASH'
};

const PAYMENT_STATUS = {
    PENDING:             'PENDING',
    SUCCESSFUL:          'SUCCESSFUL',
    FAILED:              'FAILED',
    REFUNDED:            'REFUNDED',
    PARTIALLY_REFUNDED:  'PARTIALLY_REFUNDED'
};

const REFUND_STATUS = {
    PENDING:    'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED:  'COMPLETED',
    FAILED:     'FAILED'
};

const DEFECT_SEVERITY = {
    LOW:      'LOW',
    MEDIUM:   'MEDIUM',
    HIGH:     'HIGH',
    CRITICAL: 'CRITICAL'
};

const DEFECT_STATUS = {
    OPEN:        'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED:    'RESOLVED'
};

const EVENT_BOOKING_STATUS = {
    PENDING:   'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED'
};

const RECURRENCE_TYPE = {
    DAILY:   'DAILY',
    WEEKLY:  'WEEKLY',
    MONTHLY: 'MONTHLY'
};

module.exports = {
    ROLES,
    BOOKING_STATUS,
    PAYMENT_TYPE,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    REFUND_STATUS,
    DEFECT_SEVERITY,
    DEFECT_STATUS,
    EVENT_BOOKING_STATUS,
    RECURRENCE_TYPE
};