const express = require('express');
const path = require('path');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define the views directory (where your EJS files are located)
app.set('views', path.join(__dirname, 'views'));

// Serve the index.ejs directly at the root route
app.get('/', (req, res) => {
    res.render('index', {
        title: 'My Dynamic Page',         // Dynamic title for the page
        header: 'Welcome to My Website',  // Dynamic header
        description: 'This is a dynamic page generated with EJS.', // Dynamic description
        year: new Date().getFullYear()    // Current year dynamically
    });
});

// Set up your server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
