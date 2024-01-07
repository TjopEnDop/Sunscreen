// Import required middleware
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

// initialise constants for app and server
const app = express();
const port = 3000;

// create constants for 2 APIs I used - Google Maps Geocode (Geolocation did not seem to work correctly on a local server), and OpenUV
const mapsAPI_URL = "https://maps.googleapis.com/maps/api/geocode/json?";
const mapsAPI = "AIzaSyCEyHpfEpfy557269_TmQUnhsb8zi_BAx8"
const uvAPI_URL = "https://api.openuv.io/api/v1/uv?";
const uvAPI = "openuv-emherlr388r7j-io";
const config = {
  headers: { "x-access-token": uvAPI },
};

// Variable to store address data from user frontend input
let address;
// Variables to later contain collected lat & lng data from Geocode
let mapsLat;
let mapsLng;

// Access public folder for styles
app.use(express.static("public"));
// Bodyparser app to collect data from frontend form
app.use(bodyParser.urlencoded({ extended: true }));

// Run GET method on root of server to render index page
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

// Run POST method on root of server to run input form and display results
app.post("/", async (req, res) => {
    // Run "try/catch" function to catch any errors
    try {    
        // populate address variable with frontend form input data
        address = req.body["street"].replaceAll(" ", "%20");

        // Axios POST command to get co-ordinates from input address
        const mapsResponse = await axios.post(mapsAPI_URL + `address=${address}&key=${mapsAPI}`);
        const mapsResult = mapsResponse.data.results;

        // Logging co-ordinates to debug whether they come through or not
        console.log(mapsResult[0].geometry.location);

        // populate variables with the corrisponding co-ordinate data from POST command
        mapsLat = mapsResult[0].geometry.location.lat;
        mapsLng = mapsResult[0].geometry.location.lng;

        // Axios GET command to get uv data from OpenUV based on Geocode co-ordinates
        const uvResponse = await axios.get(uvAPI_URL + `lat=${mapsLat}&lng=${mapsLng}`, config);
        const uvResult = uvResponse.data;
        
        // Render result of function in try command
        res.render("index.ejs", {
            // send object containing uv data to frontend for display
            uv: uvResult.result.uv,
        });
      } catch (error) {
        // Displaying error message via console log if it happens
        console.error("Failed to make request:", error.message);
        // Also sending the error message to the front end for the user to see
        res.render("index.ejs", {
          error: error.message,
        });
      }
});

// Listen to initialised port to get server running
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});