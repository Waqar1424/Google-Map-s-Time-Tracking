import react, {useEffect,useState, useRef} from 'react';
import './test.css';
import bitlogicx from './images/bitlogicx.png'
import {Navbar, NavbarBrand} from 'reactstrap';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer} from '@react-google-maps/api';

const center = {};
const initial_time={};

function App() {
  
  const [map,setMap] = useState(/** @type google.maps.Map */(null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [actualTime, setActualTime]= useState('');
  const [empty,setEmpty]=useState(false);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();

  useEffect (()=>{
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log("Latitude is :", position.coords.latitude);
        console.log("Longitude is :", position.coords.longitude);
        center.lat=position.coords.latitude;
      center.lng=position.coords.longitude;
      });
    }
  });

  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: ['places']
  })

    function getReverseGeocodingData() {
    // eslint-disable-next-line no-undef
    var latlng = new google.maps.LatLng(center.lat, center.lng);
    // This is making the Geocode request
    // eslint-disable-next-line no-undef
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng },  (results, status) =>{
      // eslint-disable-next-line no-undef
        if (status !== google.maps.GeocoderStatus.OK) {
            alert(status);
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        // eslint-disable-next-line no-undef
        if (status === google.maps.GeocoderStatus.OK) {
            console.log(results);
            var address = (results[0].formatted_address);
            document.getElementById('currentLocation').value = address;
            console.log(address);
        }
    });
}

  //Checking Map is loaded or not
  if(!isLoaded){
    return("Loading...");
  }


  // Getting Routes, Distance and Duration Between Two Given Positions 
  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return alert('PLease enter Origin and Destination Point!');
    }
    const selectedMode = document.getElementById("mode").value;
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode[selectedMode],
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    console.log(originRef+destinationRef);
    setEmpty(true);
  }

  function getInitialTime(){
      if(empty===false){
        alert("PLease enter Origin and Destination Point!");
      }else{
        initial_time.currentTimeInSeconds1=Math.floor(Date.now()/1000); 
        console.log(initial_time.currentTimeInSeconds1);
      }

  }
  


  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h === 1 ? " hour: " : " hours: ") : "";
    var mDisplay = m > 0 ? m + (m === 1 ? " min: " : " mins: ") : "";
    var sDisplay = s > 0 ? s + (s === 1 ? " sec" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

  function actual_time(){
    const currentTimeInSeconds2=Math.floor(Date.now()/1000); 
    console.log(currentTimeInSeconds2);
    const time=currentTimeInSeconds2-initial_time.currentTimeInSeconds1;
    console.log(time);
     const display=secondsToHms(time);
     setActualTime(display);
    console.log("Actual Time: "+display);
  }
  return (
    <div>
        <Navbar color="light" light>
          <NavbarBrand href='/'><img src={bitlogicx} alt='Bitlogicx' /></NavbarBrand>
        </Navbar>
      
    <div className="container-fluid">
        <div className='row'>
          <div className="col-12 col-sm-4">
                  <Autocomplete>
                  <input className="form-control form-control-lg origin rounded-0" id='currentLocation' type="text" placeholder="Origin" aria-label=".form-control-lg example" ref={originRef}/>
                  </Autocomplete>
                  <Autocomplete>
                  <input className="form-control form-control-lg rounded-0" type="text" placeholder="Destination" aria-label=".form-control-lg example" ref={destinationRef} />
                  </Autocomplete>
                  <button type="button" className="btn col-8 offset-2 bg-secondary text-light" onClick={getReverseGeocodingData}>Use Current Location</button>
                  <div id="floating-panel1">
                      <b className="offset-1">Mode of Travel:</b>
                      <select id="mode">
                          <option value="DRIVING">Driving</option>
                          <option value="WALKING">Walking</option>
                          <option value="TRANSIT">Transit</option>
                      </select>
                      </div>
                  <button className="btn btn-block bg-secondary text-light" type="button" onClick={calculateRoute}>Calculate Route</button>

                  <p><strong>Distance: </strong>{distance}<strong className="offset-3">Time: </strong>{duration}</p>

                  <button type="button" className="col-4 btn btn-success offset-1" onClick={getInitialTime}>Start</button>
                  <button type="button" className="col-4 btn btn-danger offset-2" onClick={actual_time}>End</button>

                  <p><strong>Actual Time: </strong>{actualTime}</p>
            </div>
            <div className="col-12 col-sm-8  map">
            <GoogleMap 
           center={center}
           zoom={15}
           mapContainerStyle={{ width: '100%', height: '100%' }}
           options={{ 
             streetViewControl: false,
             mapTypeControl: false,
             fullscreenControl: false
            }}
            onLoad={(map) => setMap(map)}
           >
         <Marker position={center}></Marker>
         {directionsResponse && <DirectionsRenderer draggable={true} directions={directionsResponse}/>}
        </GoogleMap>
            </div>
          </div>
    </div>
        </div>
  );
}

export default App;
