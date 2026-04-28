// calc nights
const calcNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end   = new Date(checkOut);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

// is valid date range
const isValidDateRange = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end   = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start) || isNaN(end)) return false;  // invalid dates
    if (start < today)              return false;   // can't book in the past
    if (end <= start)               return false;   // checkout must be after checkin
    return true;
};

module.exports = { calcNights, isValidDateRange };