const form = document.querySelector("form"); 
const cityInput = document.querySelector("#search-input"); 

// DOM Elements
const city_N = document.querySelector("#city_name");
const temp = document.querySelector("#temperature");
const condition = document.querySelector("#Description");
const videoElement = document.querySelector("video");
const sourceElement = document.querySelector("source");

//  Fetch Current Weather Function
async function fetchWeather(cityName = "Karachi") {
    const api_key = "c9a69017929e76efc6c86b3045b89786";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api_key}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("City not found");
        }
        const data = await response.json();

        // Core Content Update
        city_N.innerText = data.name;
        temp.innerText = Math.round(data.main.temp) + "°";
        condition.innerText = data.weather[0].description; 

        // Premium Feature 
        const feelsLikeEl = document.querySelector("#feels_like");
        const humidityEl = document.querySelector("#humidity");
        const windEl = document.querySelector("#wind_speed");

        if(feelsLikeEl) feelsLikeEl.innerText = Math.round(data.main.feels_like) + "°";
        if(humidityEl) humidityEl.innerText = data.main.humidity + "%";
        if(windEl) windEl.innerText = Math.round(data.wind.speed * 3.6) + " km/h"; // m/s to km/h conversion

        // Weather Condition Logic
        const weatherCondition = data.weather[0].main.toLowerCase();
        const iconCode = data.weather[0].icon;
        const isNight = iconCode.endsWith('n');

        // Upgraded Video Selection (Image ke mutabiq saare assets link kar diye hain)
if (weatherCondition === "clear") {
    sourceElement.src = isNight ? "assets/videos/clearnight.mp4" : "assets/videos/clearday.mp4";
} 
else if (weatherCondition === "rain" || weatherCondition === "drizzle" || weatherCondition.includes("thunderstorm")) {
    sourceElement.src = isNight ? "assets/videos/rainnight.mp4" : "assets/videos/rain.mp4";
} 
else if (weatherCondition === "clouds" || weatherCondition.includes("overcast")) {
    sourceElement.src = isNight ? "assets/videos/cloudnight.mp4" : "assets/videos/cloud.mp4";
} 
// Haze, Mist, Fog ya Smoke ke liye assets link kar diye:
else if (weatherCondition.includes("haze") || weatherCondition.includes("mist") || weatherCondition.includes("fog") || weatherCondition.includes("smoke")) {
    sourceElement.src = isNight ? "assets/videos/hazenight.mp4" : "assets/videos/haze.mp4";
} 
else if (weatherCondition.includes("snow")) {
    sourceElement.src = isNight ? "assets/videos/snownight.mp4" : "assets/videos/snow.mp4";
} 
else {
    sourceElement.src = isNight ? "assets/videos/clearnight.mp4" : "assets/videos/clearday.mp4";
}


if (videoElement) {
    // 1. Pehle chalne wali request ko pause karein
    videoElement.pause(); 
    
    // 2. Nayi video stream load karein
    videoElement.load();  
    
    // 3. BEST FIX: Jab tak pehla frame ready na ho, tab tak play na karein
    videoElement.onloadeddata = async () => {
        try {
            await videoElement.play();
        } catch (error) {
            // Agar baar-baar request se interrupt ho bhi jaye, toh app crash nahi hogi
            console.log("Playback interruption handled safely:", error.message);
        }
    };
}


    } catch (error) {
        alert("City not found. Please enter a valid city name.");
        console.error(error);
    }
}

//  Fetch Hourly Forecast
async function fetchForecast(cityName = "Karachi") {
    const api_key = "c9a69017929e76efc6c86b3045b89786";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${api_key}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) return; 
        const data = await response.json();

        // 8 forecast items (next 24 hours)
        const hourlyData = data.list.slice(0, 10); 
        updateHourlyUI(hourlyData);
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

//   UI Function 
function updateHourlyUI(data) {
    const container = document.querySelector("#hourly-container");
    if (!container) return; 
    
    container.innerHTML = ""; 

    data.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon; 

        const iconUrl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";

        const card = `
            <div class="flex flex-col items-center min-w-[90px] sm:min-w-[100px] bg-white/5 border border-white/5 p-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95 cursor-pointer shadow-md">
                <span class="text-[11px] opacity-70 font-sans tracking-wide">${time}</span>
                <img src="${iconUrl}" class="w-12 h-12 my-1 drop-shadow-lg" alt="weather">
                <span class="text-base font-semibold font-sans">${temp}°</span>
            </div>
        `;

        container.innerHTML += card;
    });
}

// 4. Form Event Listener
form.addEventListener("submit", (event) => {
    event.preventDefault(); 
    const cityName = cityInput.value.trim();
    if (cityName) {
        fetchWeather(cityName);
        fetchForecast(cityName); 
        cityInput.value = ""; 
    }
});


function setCurrentDate() {
    const dateEl = document.querySelector("#live-date");
    if (dateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        dateEl.innerText = new Date().toLocaleDateString('en-US', options);
    }
}

//  Execution Calls
setCurrentDate();
fetchWeather("Karachi");
fetchForecast("Karachi");
