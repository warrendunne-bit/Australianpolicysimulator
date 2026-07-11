import { AssumptionsPanel } from '../AssumptionsPanel';
import { ScenarioSetup } from '../ScenarioSetup';
import { ScenarioSummary } from '../ScenarioSummary';
import { CollapsibleSection, Panel } from '../shared';
import type { PolicySettings, SimulationHorizon, SimulationResult } from '../../simulation/model';
import type { ScenarioPreset } from '../../simulation/presets';
import type { Outcome } from './cockpitShared';
import { FinanceBreakdownList } from './cockpitShared';

export function SettingsPage({
  horizon,
  presets,
  selectedEventIds,
  selectedPresetId,
  onEventToggle,
  onHorizonChange,
  onPresetSelect,
  transparentCalculationNotes,
  financeBreakdown,
  results,
  outcomes,
  policies,
}: {
  horizon: SimulationHorizon;
  presets: ScenarioPreset[];
  selectedEventIds: string[];
  selectedPresetId: string;
  onEventToggle: (eventId: string) => void;
  onHorizonChange: (horizon: SimulationHorizon) => void;
  onPresetSelect: (presetId: string) => void;
  transparentCalculationNotes: string[];
  financeBreakdown: Outcome['financeBreakdown'];
  results: SimulationResult;
  outcomes: Outcome;
  policies: PolicySettings;
}) {
  return (
    <>
      <AssumptionsPanel />
      <ScenarioSetup
        horizon={horizon}
        presets={presets}
        selectedEventIds={selectedEventIds}
        selectedPresetId={selectedPresetId}
        onEventToggle={onEventToggle}
        onHorizonChange={onHorizonChange}
        onPresetSelect={onPresetSelect}
      />
      <CollapsibleSection title="Transparent Calculations">
        <div className="details-grid">
          <Panel title="Transparent Calculations">
            <ul>{transparentCalculationNotes.map((note) => (<li key={note}>{note}</li>))}</ul>
          </Panel>
          <Panel title="Government Finance Breakdown">
            <FinanceBreakdownList financeBreakdown={financeBreakdown} results={results} outcomes={outcomes} />
          </Panel>
          <Panel title="Entity Model">
            <ul>
              <li>Person entities sit inside representative Household entities and carry income, skills, wellbeing and social connection state.</li>
              <li>Household entities update consumption, housing security, cohesion, fairness pressure and wellbeing.</li>
              <li>Company entities update productivity, hiring demand, profitability and investment.</li>
              <li>Government and Environment entities update after households and companies respond.</li>
              <li>The World object applies policies, events and annual updates, then records history.</li>
            </ul>
          </Panel>
        </div>
      </CollapsibleSection>
      <ScenarioSummary horizon={horizon} outcomes={outcomes} policies={policies} selectedEventIds={selectedEventIds} />
    </>
  );
}
