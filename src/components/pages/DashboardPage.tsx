import type { SuccessScoreResult } from '../../simulation/SuccessScore';
import { formatNumber, formatPercent } from '../formatters';
import type { Outcome } from './cockpitShared';
import { CompactPolicyLever, DashboardIndicator, policyStance } from './cockpitShared';

export function DashboardPage({
  outcomes,
  selectedNarrative,
  selectedYearSuccessNarrative,
  successScore,
  successScoreChange,
  hasPendingDecisionChanges,
  immigrationRate,
  housingBuildRate,
  integrationEffectiveness,
  skillsAlignment,
  infrastructureReadiness,
  taxRate,
  stimulusRate,
  showTurnReveal,
  onEndYear,
  onSectionChange,
}: {
  outcomes: Outcome;
  selectedNarrative: string;
  selectedYearSuccessNarrative: string;
  successScore: SuccessScoreResult;
  successScoreChange: number;
  hasPendingDecisionChanges: boolean;
  immigrationRate: number;
  housingBuildRate: number;
  integrationEffectiveness: number;
  skillsAlignment: number;
  infrastructureReadiness: number;
  taxRate: number;
  stimulusRate: number;
  showTurnReveal: boolean;
  onEndYear: () => void;
  onSectionChange: (section: string) => void;
}) {
  return (
    <section className="dashboard-command-centre section-block">
      <div className="dashboard-hero-card">
        <p className="eyebrow">Prime Minister Briefing</p>
        <h2>National situation dashboard</h2>
        <p>
          Growth is improving, but the annual agenda must balance housing, services, fairness,
          environment and the budget. The cards below show the most recently enacted results.
          Adjust the major levers to draft a pending agenda, then press <strong>End Year</strong> to
          apply those choices and refresh the annual consequences.
        </p>
        <ul>
          <li>Overall national score: <strong>{successScore.score.toFixed(1)}</strong></li>
          <li>{selectedYearSuccessNarrative}</li>
          <li>
            {hasPendingDecisionChanges
              ? 'Pending agenda drafted: national results will update after End Year.'
              : 'No pending agenda: displayed results reflect the enacted annual agenda.'}
          </li>
        </ul>
      </div>

      <div className="dashboard-score-card">
        <span>National score</span>
        <strong>{successScore.score.toFixed(1)}</strong>
        <em className={successScoreChange < 0 ? 'is-negative' : ''}>
          {successScoreChange >= 0 ? '+' : ''}{successScoreChange.toFixed(1)} from previous year
        </em>
      </div>

      <div className="dashboard-indicator-grid">
        <DashboardIndicator label="Population" value={formatNumber(outcomes.populationIncrease)} status={outcomes.populationIncrease > 0 ? 'Improving' : 'Stable'} note="Population change is enacted after the annual turn." />
        <DashboardIndicator label="Economy" value={formatPercent(outcomes.economicGrowth)} status={outcomes.economicGrowth >= 2.5 ? 'Improving' : 'Stable'} note="Growth reflects migration, skills, companies and fiscal settings." />
        <DashboardIndicator label="Housing" value={outcomes.housingStress.toFixed(1)} status={outcomes.housingStress > 70 ? 'Critical' : outcomes.housingStress > 55 ? 'Warning' : 'Stable'} note="Housing pressure rises when demand runs ahead of new supply." />
        <DashboardIndicator label="Wellbeing" value={outcomes.wellbeing.toFixed(1)} status={outcomes.wellbeing > 65 ? 'Improving' : 'Stable'} note="Wellbeing combines household, service and feedback effects." />
        <DashboardIndicator label="Fairness / cohesion" value={outcomes.socialCohesion.toFixed(1)} status={outcomes.socialCohesion < 55 ? 'Warning' : 'Stable'} note="Cohesion reflects trust, integration and service pressure." />
        <DashboardIndicator label="Environment" value={outcomes.environmentalPressure.toFixed(1)} status={outcomes.environmentalPressure > 70 ? 'Critical' : outcomes.environmentalPressure > 55 ? 'Warning' : 'Stable'} note="Environmental pressure is lower-is-better in this prototype." />
      </div>

      <div className="dashboard-policy-levers">
        <CompactPolicyLever label="Migration" value={formatPercent(immigrationRate)} stance={policyStance(immigrationRate, 1.4, 2.8, 4)} onOpen={() => onSectionChange('Policies')} />
        <CompactPolicyLever label="Housing build" value={formatNumber(housingBuildRate)} stance={policyStance(housingBuildRate, 120000, 220000, 300000)} onOpen={() => onSectionChange('Policies')} />
        <CompactPolicyLever label="Tax level" value={formatPercent(taxRate)} stance={policyStance(taxRate, 18, 30, 42)} onOpen={() => onSectionChange('Budget')} />
        <CompactPolicyLever label="Spending" value={formatPercent(stimulusRate)} stance={policyStance(stimulusRate, 2, 5, 8)} onOpen={() => onSectionChange('Budget')} />
        <CompactPolicyLever label="Infrastructure" value={infrastructureReadiness.toFixed(0)} stance={policyStance(infrastructureReadiness, 35, 65, 85)} onOpen={() => onSectionChange('Policies')} />
        <CompactPolicyLever label="Integration / skills" value={`${Math.round((integrationEffectiveness + skillsAlignment) / 2)}`} stance={policyStance((integrationEffectiveness + skillsAlignment) / 2, 35, 65, 85)} onOpen={() => onSectionChange('Policies')} />
      </div>

      <div className="dashboard-result-card">
        <span>Latest annual result</span>
        <strong>{showTurnReveal ? 'Cabinet result revealed' : 'Awaiting next annual turn'}</strong>
        <p>{selectedNarrative}</p>
        <button type="button" onClick={onEndYear}>End Year</button>
      </div>
    </section>
  );
}
