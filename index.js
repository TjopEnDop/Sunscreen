// Import required middleware
import express from "express";
import axios from "axios";

// initialise constants for app and server
const app = express();
const port = 3000;

// create constants for 2 APIs I used - Google Maps Geolocation, and OpenUV
const mapsAPI_URL = "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCEyHpfEpfy557269_TmQUnhsb8zi_BAx8";
const uvAPI_URL = "https://api.openuv.io/api/v1/uv?";
const uvAPI = "openuv-emherlr388r7j-io";
const config = {
  headers: { "x-access-token": uvAPI },
};

// Access public folder for styles
app.use(express.static("public"));

// Run Get method on root of server to run entire process
app.get("/", async (req, res) => {
    // Run "try/catch" function to catch any errors
    try {
        // mapsResponse gets the user's current location via Maps Geolocation, and returns the lat and lng values required by OpenUV. This HAS to be done as a POST request as per Google's documentation.
        const mapsResponse = await axios.post(mapsAPI_URL);
        const mapsResult = mapsResponse.data;

        // Logging uvResult for debugging purposes
        console.log(mapsResult);

        // uvResponse gets the UV index from OpenUV using the object data collected by mapsResponse (Via the mapsResult object).
        const uvResponse = await axios.get(uvAPI_URL + `lat=${mapsResult.location.lat}&lng=${mapsResult.location.lng}`, config);
        const uvResult = uvResponse.data;

        // Rendering index.ejs and only sending the "uv" parameter inside the uvResult object, as nothing else is required for this to work as expected.
        res.render("index.ejs", {
            uv: uvResult.result.uv,
        });

        // Logging uvResult for debugging purposes
        console.log(uvResult);
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