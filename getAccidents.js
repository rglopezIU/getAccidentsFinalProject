// Import bigquery
const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery();

// Function to calculate accidents in area for a given radius (in miles)
function calculateAccidentRadius(latitude, longitude, radiusInMiles) {
  
  // Approximate conversion for latitude
  const milesToDegrees = 1 / 69;
  const latDelta = radiusInMiles * milesToDegrees;
  const lngDelta = radiusInMiles * milesToDegrees / Math.cos(latitude * Math.PI / 180);

  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLng = longitude - lngDelta;
  const maxLng = longitude + lngDelta;

  return {
    minLat,
    maxLat,
    minLng,
    maxLng
  };
}

// Function to query BigQuery and count accidents within the bounding box
async function countAccidents(latitude, longitude, radiusInMiles) {
    try {
        const {minLat, maxLat, minLng, maxLng} = calculateAccidentRadius(latitude, longitude, radiusInMiles);

        const query = `
            SELECT COUNT(*) as accidentCount
            FROM \`cit412-final-project.us_accidents.source-data\`
            WHERE 
                Start_Lat BETWEEN ${minLat} AND ${maxLat}
                AND Start_Lng BETWEEN ${minLng} AND ${maxLng}
        `;

        const options = {
            query: query,
            //dataset only has US currently
            location: 'US',
        };

        // Run the query
        const [rows] = await bigquery.query(options);

        if (rows.length > 0) {
            console.log(`Total accidents within ${radiusInMiles} mile(s): ${rows[0].accidentCount}`);
        } else {
            console.log('No accidents found within the specified radius.');
        }
    } catch (error) {
        console.error('Error running BigQuery:', error);
    }
}

// the cordinates below are for 82nd st & allison pointe blvd
// other wise known as an area with plenty of accidents
// test latitude
const userLatitude = 39.9050257;
// test longitude
const userLongitude = -86.0832871;
// Radius in miles
const radiusMiles = 1;

// Call the function to count accidents within the specified radius
countAccidents(userLatitude, userLongitude, radiusMiles);
