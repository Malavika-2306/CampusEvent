const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));


const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
    res.send('Campus Event Platform API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
