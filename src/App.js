import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { scaleSequentialSqrt, interpolateYlOrRd } from 'd3';

import './App.css';

function App() {
  const globeEl = useRef();
  const [apiData, setApiData] = useState([]);
  const [globeData, setGlobeData] = useState([]);

  useEffect(() => {
    const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';
    fetch(corsAnywhere + 'https://covid-api.mmediagroup.fr/v1/cases')
      .then(res => res.json())
      .then(setApiData)
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (!apiData) return;
    const countries = Object.entries(apiData)
      .map(([key, value]) => ({
        country: key,
        data: value['All']
      }));
    const mappedDeaths = countries.map(({ data }) => data.deaths);
    const deathMax = Math.max(0, ...mappedDeaths);
    const deathMin = Math.min(0, ...mappedDeaths);
    const mappedGlobeData = countries.map(({ country, data }) => ({
      country,
      lat: data.lat,
      lng: data.long,
      size: (data.deaths - deathMin) / (deathMax - deathMin),
      deaths: data.deaths,
      confirmed: data.confirmed,
      recovered: data.recovered,
      population: data.population,
      updated: data.updated,
    }));

    setGlobeData(mappedGlobeData);
  }, [apiData]);

  const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([0, 1e7]);

  return (
    <div id="app-container" className="App">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        pointsData={globeData}
        pointAltitude={d => d.size}
        pointLabel={d => `${d.country} -- \nConfirmed: ${d.confirmed}\nRecovered: ${d.recovered}\nDeaths: ${d.deaths}\nPopulation: ${d.population}\nUpdated: ${d.updated}`}
        pointColor={d => weightColor(d.confirmed)}
      />
    </div>
  );
}

export default App;
