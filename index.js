const express = require("express");
const connectDB = require("./config/db");
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
// connect to DB
connectDB();

// Init middleware
app.use(express.json({
    extended: false
}));


app.get('/', (req, res) => res.json({
    msg: "Welcome to the Pokedex API"
}));


// defining routes
app.use('/api/users', require('./routes/users'))
app.use('/api/pokemon', require('./routes/pokemon'))
app.use('/api/auth', require('./routes/auth'))

const PORT = process.env.port || 5000

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });

app.listen(`${PORT}`, () => {
    console.log(`Pokemon server started successfully in port ${PORT}`);
});