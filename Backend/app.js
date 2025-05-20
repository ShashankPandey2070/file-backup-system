require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const credentialRoutes = require('./routes/credentialRoutes');
const exportRoutes = require('./routes/exportRoutes');
// You would add others like exportRoutes as well

app.use('/api', credentialRoutes);
app.use('/export', exportRoutes);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
