import type { SimulationResult } from '../../simulation/model';
import { formatMoney, formatNumber, formatPercent } from '../formatters';
import { CollapsibleSection, InfoBox, MetricStrip, PolicyCard, PolicySlider } from '../shared';
import type { Outcome, SetNumber } from './cockpitShared';

export function PoliciesPage({
  outcomes,
  metrics,
  financeBreakdown,
  capacityEnough,
  immigrationRate,
  housingBuildRate,
  integrationEffectiveness,
  skillsAlignment,
  infrastructureReadiness,
  taxRate,
  stimulusRate,
  onImmigrationChange,
  onHousingBuildChange,
  onIntegrationChange,
  onSkillsChange,
  onInfrastructureChange,
  onTaxChange,
  onStimulusChange,
}: {
  outcomes: Outcome;
  metrics: SimulationResult['metrics'];
  financeBreakdown: Outcome['financeBreakdown'];
  capacityEnough: string;
  immigrationRate: number;
  housingBuildRate: number;
  integrationEffectiveness: number;
  skillsAlignment: number;
  infrastructureReadiness: number;
  taxRate: number;
  stimulusRate: number;
  onImmigrationChange: SetNumber;
  onHousingBuildChange: SetNumber;
  onIntegrationChange: SetNumber;
  onSkillsChange: SetNumber;
  onInfrastructureChange: SetNumber;
  onTaxChange: SetNumber;
  onStimulusChange: SetNumber;
}) {
  return (
    <CollapsibleSection title="Government Policy Decisions" defaultOpen>
      <div className="policy-grid">
        <PolicyCard title="Population & Migration">
          <PolicySlider label="Immigration Rate" value={immigrationRate} min={0} max={5} step={0.1} unit="population rate" valueFormatter={formatPercent} onChange={onImmigrationChange} />
          <InfoBox>
            At {formatPercent(immigrationRate)}, immigration adds about {formatNumber(outcomes.populationIncrease)} people each year and creates demand for {formatNumber(outcomes.housingDemand)} homes. It contributes {formatPercent(metrics.immigrationGrowthBoost)} to growth after entity capacity is considered, and {capacityEnough}
          </InfoBox>
          <PolicySlider label="Integration Effectiveness" value={integrationEffectiveness} min={0} max={100} step={1} unit="employment, language, community, and civic participation" onChange={onIntegrationChange} />
          <PolicySlider label="Skills Alignment" value={skillsAlignment} min={0} max={100} step={1} unit="match to labour shortages" onChange={onSkillsChange} />
          <PolicySlider label="Infrastructure Readiness" value={infrastructureReadiness} min={0} max={100} step={1} unit="schools, hospitals, roads, transport and services" onChange={onInfrastructureChange} />
          <MetricStrip items={[["Absorptive Capacity Score", outcomes.absorptiveCapacityScore.toFixed(1)], ["Absorptive Capacity Status", outcomes.absorptiveCapacityStatus]]} />
        </PolicyCard>

        <PolicyCard title="Housing & Fairness">
          <PolicySlider label="Housing Build Rate" value={housingBuildRate} min={50_000} max={350_000} step={5_000} unit="homes per year" onChange={onHousingBuildChange} />
          <InfoBox>Housing supply is compared with demand of {formatNumber(outcomes.housingDemand)} homes. Representative renters and young workers are most sensitive to the resulting stress.</InfoBox>
          <MetricStrip items={[["Housing Stress", outcomes.housingStress.toFixed(1)], ["Fairness Score", outcomes.fairness.toFixed(1)]]} />
          <InfoBox>{outcomes.fairnessExplanation}</InfoBox>
        </PolicyCard>

        <PolicyCard title="Government & Taxation">
          <PolicySlider label="Tax Rate" value={taxRate} min={0} max={50} step={1} unit="of income" valueFormatter={formatPercent} onChange={onTaxChange} />
          <PolicySlider label="Government Stimulus" value={stimulusRate} min={0} max={10} step={0.5} unit="extra spending" valueFormatter={formatPercent} onChange={onStimulusChange} />
          <InfoBox>Tax adds about {formatMoney(financeBreakdown.taxRevenueBoost)} to revenue. Stimulus adds {formatMoney(financeBreakdown.stimulusSpendingBoost)} to spending.</InfoBox>
        </PolicyCard>
      </div>
    </CollapsibleSection>
  );
}
