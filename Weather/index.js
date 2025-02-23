// all the DOM elements who store in a variables
const mainCity = document.getElementById("mainCity");
const mainTemp = document.getElementById("mainTemp");
const mainWind = document.getElementById("mainWind");
const mainHumidity = document.getElementById("mainHumidity");
const mainImg = document.getElementById("mainImg");
const mainFeels = document.getElementById("mainFeels");
const mainDate = document.getElementById("date");
const cards = document.querySelector(".cards");
const locations = document.getElementById("locations");
const inputCity = document.querySelector("input");
const searchBtn = document.querySelector("#search")
const currentLocationBtn = document.querySelector("#currentLocationBtn")
const Previous_City = new Set();
const Stored_Cities = JSON.parse(localStorage.getItem("Previous_City")) || [];
const date = new Date();
mainDate.textContent = date.toLocaleDateString();

// latitude and longitude are undefined, to access in whole document
let userLatitude = undefined;
let userLongitude = undefined;


// added EventListener for search functionality
searchBtn.addEventListener("click", () => {
    if (!inputCity.value) {
        alert("Please enter City Name");
    } else {
        fetchForecast(false, false, inputCity.value);
        showPosition(false, inputCity.value);
    }
})

// get current location when click on button below
currentLocationBtn.addEventListener("click", () => {
    getCurrentUserLocation();
})


// search stored city in the localhost which is history, and it also has unique values 
locations.addEventListener("change", (e) => {
    let item = e.target.value
    fetchForecast(false, false, item);
    showPosition(false, item);
})


// if cities are present in localstorage, then adding them in a set
if (Stored_Cities) {
    Stored_Cities.forEach(item => {
        Previous_City.add(item)
    });
}

const showLoader = () => {
    document.querySelector(".loader").style.display = "flex"
    document.querySelector(".maincontainer").style.display = "none"
}

const hideLoader = () => {
    document.querySelector(".maincontainer").style.display = "flex"
    document.querySelector(".loader").style.display = "none"
}

// Current location of user where location permission is required
const getCurrentUserLocation = () => {
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            console.log("Geolocation is not supported, try another browser.");
        }
    }
    const showError = (err) => {
        alert(err.message)
        return console.warn(err)
    }
    getLocation();
}

// function to fetch 5 days forecast,fetch based on latitude, longitude or on location  
const fetchForecast = async (userLatitude, userLongitude, location = false) => {

    let response = undefined;
    showLoader();
    if (location) {
        try {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${"58eaec513d918c56e6a52478dda1c8e8"}&units=metric`);
        } catch (error) {
            console.log(error)
        }

    } else {
        try {
            response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${userLatitude}&lon=${userLongitude}&appid=${"58eaec513d918c56e6a52478dda1c8e8"}&units=metric`);
        } catch (error) {
            console.log(error)
        }
    }

    const data = await response.json();
    data && hideLoader();
    if (data.cod == 404) {
        alert("Invalid City")
        document.location.reload();
    }
    if (data.city.name) {
        Previous_City.add(data.city.name);
        localStorage.setItem("Previous_City", JSON.stringify(Array.from(Previous_City)));
        setPrevLocations();
    }
    const forecast = data.list.filter((item, index) => {
        return index%8 === 0;
    })
    cards.innerHTML = "";
    forecastMap(forecast)
}

// Display to forecast the data 
const forecastMap = (forecast) => {
    forecast.map((item) => {
        const cardContent = document.createElement("div");
        cardContent.classList.add("card", "w-full", "xs:w-[13rem]", "p-4", "backdrop-blur-sm", "bg-[#ffffff5c]", "transition-all", "hover:bg-[#ff00005c]", "border", "border-white");

        cardContent.innerHTML = `<h3>${item.dt_txt.split(" ")[0]}</h3>
            <img src="http://openweathermap.org/img/w/${item.weather[0].icon}.png" width="100px" alt="" />
            <p>Temperature: ${item.main.temp}℃</p>
            <p>Wind: ${item.wind.speed} M/S</p>
            <p>Humidity: ${item.main.humidity}%</p>`
        cards.appendChild(cardContent);
    })
}
  
const showPosition = async (position, location = false) => {
    if (location) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${"58eaec513d918c56e6a52478dda1c8e8"}&units=metric`)
            const data = await response.json();
            setMainData(data);
        } catch (error) {
            console.log(error)
        }
    } else {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${userLatitude}&lon=${userLongitude}&appid=${"58eaec513d918c56e6a52478dda1c8e8"}&units=metric`)
            const data = await response.json();
            setMainData(data);
            fetchForecast(userLatitude, userLongitude);
        } catch (error) {
            console.log(error)
        }
    }
}

// Display previous location, where refresh is required 
const setPrevLocations = () => {
    locations.innerHTML = `<option value="-1" selected disabled>Select Location</option>`;
    Array.from(Stored_Cities).map((item) => {
        let node = document.createElement("option");
        node.classList.add("prevLocationSearch")
        node.value = item;
        node.textContent = item;
        return locations.appendChild(node);
    })

}

// Setting the weather data 
const setMainData = (data) => {

    mainCity.textContent = data.name;
    mainTemp.textContent = data.main.temp;
    mainWind.textContent = data.wind.speed;
    mainHumidity.textContent = data.main.humidity;
    mainImg.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    mainFeels.textContent = data.weather[0].description;

}

getCurrentUserLocation();
