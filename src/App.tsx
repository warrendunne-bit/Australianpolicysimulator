import { useState } from "react";

function App() {
  const [immigration, setImmigration] = useState(2);
  const [housingBuild, setHousingBuild] = useState(1);

  const population = 27000000 + immigration * 100000;

  const housingStress =
    immigration > housingBuild ? "Increasing" : "Stable";

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Australia Policy Simulator</h1>

      <h2>Policy Settings</h2>

      <p>Immigration Rate: {immigration}%</p>

      <input
        type="range"
        min="0"
        max="5"
        value={immigration}
        onChange={(e) => setImmigration(Number(e.target.value))}
      />

      <p>Housing Build Rate: {housingBuild}%</p>

      <input
        type="range"
        min="0"
        max="5"
        value={housingBuild}
        onChange={(e) => setHousingBuild(Number(e.target.value))}
      />

      <h2>Results</h2>

      <p>Population: {population.toLocaleString()}</p>

      <p>Housing Stress: {housingStress}</p>

      <h2>Current Assumptions</h2>

      <ul>
        <li>1% immigration adds 100,000 people.</li>
        <li>If immigration exceeds housing growth, housing stress rises.</li>
        <li>This is illustrative only, not predictive.</li>
      </ul>
    </div>
  );
}

export default App;