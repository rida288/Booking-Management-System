const express = require('express');
const app = express();

// 1. MUST come first: Parse the JSON body
app.use(express.json()); 

// 2. Optional but helpful: Log requests to see them in terminal
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// 3. Routes come AFTER the middleware
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// ... rest of your app setup




// Hotels , RoomType , Defects , Amenities routes 

// Hotels 
const hotelRoutes = require('./routes/hotels.routes');
app.use('/api/hotels', hotelRoutes);

// Rooms 
const roomRoutes = require('./routes/rooms.routes');
app.use('/api/rooms', roomRoutes);

// Defects 
const defectRoutes = require('./routes/defects.routes');
app.use('/api/defects', defectRoutes);

// Amenities
const amenityRoutes = require('./routes/amenity.routes');
app.use('/api/amenities', amenityRoutes);