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

  useEffect(() => {
    if ([undefined, null].includes(globeEl.current)) return;

    // Auto-rotate
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.1;
  }, [globeEl]);

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
        pointLabel={d => `<b>${d.country}</b><br/>${d.confirmed ? `<b>Confirmed</b>: ${d.confirmed}<br/>` : ''}${d.recovered ? `<b>Recovered</b>: ${d.recovered}<br/>` : ''}${d.deaths ? `<b>Deaths</b>: ${d.deaths}<br/>` : ''}${d.population ? `<b>Population</b>: ${d.population}<br/>` : ''}${d.updated ? `<b>Updated</b>: ${d.updated}` : ''}`}
        pointColor={d => weightColor(d.confirmed)}
      />
    </div>
  );
}

export default App;
