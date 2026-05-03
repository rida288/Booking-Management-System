const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

require('./src/config/db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'Hotel Management System API', status: 'Running' });
});

// ONLY ADD ROUTES YOU HAVE FULLY BUILT
// uncomment each one as you finish building it

app.use('/api/auth',     require('./src/routes/auth.routes'));
app.use('/api/hotels',   require('./src/routes/hotels.routes'));
app.use('/api/rooms',    require('./src/routes/rooms.routes'));
app.use('/api/bookings', require('./src/routes/bookings.routes'));
app.use('/api/users',    require('./src/routes/user.routes'));
app.use('/api/reviews',  require('./src/routes/reviews.routes'));
app.use('/api/payments', require('./src/routes/payments.routes'));
app.use('/api/defects',  require('./src/routes/defects.routes'));
app.use('/api/amenities',require('./src/routes/amenity.routes'));
// app.use('/api/events',   require('./src/routes/events.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
