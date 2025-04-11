import { FormEvent, useState } from 'react'
import './App.css'
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiDayCloudy,
  WiNightClear,
} from 'react-icons/wi'

function App() {
  const [location, setlocation] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Map weather descriptions to icons
  const weatherIcons: { [key: string]: React.ReactNode } = {
    Clear: <WiDaySunny size={64} color="#f39c12" />,
    Clouds: <WiCloud size={64} color="#95a5a6" />,
    Rain: <WiRain size={64} color="#3498db" />,
    Thunderstorm: <WiThunderstorm size={64} color="#9b59b6" />,
    Snow: <WiSnow size={64} color="#ecf0f1" />,
    Mist: <WiFog size={64} color="#7f8c8d" />,
    Haze: <WiFog size={64} color="#bdc3c7" />,
    Smoke: <WiFog size={64} color="#95a5a6" />,
    Drizzle: <WiDayCloudy size={64} color="#3498db" />,
    Night: <WiNightClear size={64} color="#2c3e50" />,
  };

  const fetchSuggestions = async (query: string) => {
    if (!query) return setSuggestions([]);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${import.meta.env.VITE_API_Key}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const locationHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!location) return;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${import.meta.env.VITE_API_Key}&units=metric`
      );

      if (!response.ok) {
        alert("Location not found");
        return;
      }

      const data = await response.json();
      setWeatherData(data);

      // Fetch forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${import.meta.env.VITE_API_Key}&units=metric`
      );

      if (!forecastResponse.ok) {
        alert("Forecast not found");
        return;
      }

      const forecast = await forecastResponse.json();

      // Filter 3-day forecast (midday)
      const filteredForecast = forecast.list
        .filter((item: any) => item.dt_txt.includes("12:00:00"))
        .slice(0, 3);

      setForecastData(filteredForecast);
    } catch (error) {
      console.error(error);
      setWeatherData(null);
      setForecastData([]);
    }
  };

  return (
    <>
      <div className='main-container'>
        <h1>Weather</h1>

        <form className='location-search' onSubmit={locationHandler}>
          <button type='submit'>
            <span className="material-symbols-outlined">pin_drop</span>
          </button>
          <input
            type="text"
            placeholder='Location'
            value={location}
            onChange={(e) => {
              setlocation(e.target.value);
              fetchSuggestions(e.target.value);
            }}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((sug, idx) => (
                <li key={idx} onClick={() => {
                  setlocation(`${sug.name}${sug.state ? ', ' + sug.state : ''}, ${sug.country}`);
                  setSuggestions([]);
                }}>
                  {sug.name}{sug.state ? `, ${sug.state}` : ''}, {sug.country}
                </li>
              ))}
            </ul>
          )}

        </form>

        <div className='weather'>
          {weatherData ? (
            <div className='weather-data'>
              <p>{weatherData.name} : {weatherData.main.temp}°C</p>
              {weatherIcons[weatherData.weather[0].main] || <p>{weatherData.weather[0].main}</p>}
              <p>{weatherData.weather[0].main}</p>
            </div>
          ) : (
            <p>No weather data yet</p>
          )}
        </div>

        <div className='next-three-days-weather'>
          <h2>Next 3 Days</h2>
          {forecastData.length > 0 ? (
            <div className="forecast-grid">
              {forecastData.map((day, index) => (
                <div key={index} className="forecast-day">
                  <p>{new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                  {weatherIcons[day.weather[0].main] || <p>{day.weather[0].main}</p>}
                  <p>{day.main.temp}°C</p>
                  <p>{day.weather[0].main}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No forecast available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
