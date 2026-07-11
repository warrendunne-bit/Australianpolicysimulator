import type { ComponentProps } from 'react';
import { BaselineComparisonPanel } from '../BaselineComparison';
import { CurrentYearFactorPanel } from '../CurrentYearFactorPanel';
import { EntityPanels } from '../EntityPanels';
import { FeedbackPanel } from '../FeedbackPanel';
import { NationalReports } from '../NationalReports';
import { PlaybackControls } from '../PlaybackControls';
import { SuccessScorePanel } from '../SuccessScorePanel';
import { CollapsibleSection, ExplanationList } from '../shared';
import type { SimulationResult } from '../../simulation/model';
import type { SuccessScoreResult, SuccessWeights } from '../../simulation/SuccessScore';
import type { Outcome, YearOutcome } from './cockpitShared';

export function ReportsPage({
  outcomes,
  selectedYear,
  hasPendingDecisionChanges,
  isPlaying,
  maxYear,
  onStart,
  onPlayPause,
  onStepBack,
  onStepForward,
  onYearChange,
  successScore,
  successWeights,
  successScoreChange,
  onSuccessWeightChange,
  baselineComparison,
  previousAnnualOutcome,
  previousSuccessScore,
  selectedYearSuccessNarrative,
  selectedNarrative,
  selectedEntities,
  eventResponses,
  selectedFeedback,
  selectedFeedbackExplanations,
  history,
  selectedPositiveDrivers,
  selectedNegativeDrivers,
  tradeOffs,
}: {
  outcomes: Outcome;
  selectedYear: number;
  hasPendingDecisionChanges: boolean;
  isPlaying: boolean;
  maxYear: number;
  onStart: () => void;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onYearChange: (year: number) => void;
  successScore: SuccessScoreResult;
  successWeights: SuccessWeights;
  successScoreChange: number;
  onSuccessWeightChange: ComponentProps<typeof SuccessScorePanel>['onChange'];
  baselineComparison: ComponentProps<typeof BaselineComparisonPanel>['comparison'];
  previousAnnualOutcome: YearOutcome | undefined;
  previousSuccessScore: SuccessScoreResult | null;
  selectedYearSuccessNarrative: string;
  selectedNarrative: string;
  selectedEntities: ComponentProps<typeof EntityPanels>['entities'];
  eventResponses: ComponentProps<typeof EntityPanels>['eventResponses'];
  selectedFeedback: ComponentProps<typeof FeedbackPanel>['feedback'];
  selectedFeedbackExplanations: string[];
  history: SimulationResult['history'];
  selectedPositiveDrivers: string[];
  selectedNegativeDrivers: string[];
  tradeOffs: string[];
}) {
  return (
    <>
      <NationalReports outcomes={outcomes} selectedYear={selectedYear} />
      <PlaybackControls hasPendingChanges={hasPendingDecisionChanges} isPlaying={isPlaying} maxYear={maxYear} selectedYear={selectedYear} onStart={onStart} onPlayPause={onPlayPause} onStepBack={onStepBack} onStepForward={onStepForward} onYearChange={onYearChange} />
      <SuccessScorePanel score={successScore} weights={successWeights} change={successScoreChange} hasStarted onChange={onSuccessWeightChange} />
      <BaselineComparisonPanel comparison={baselineComparison} />
      <CurrentYearFactorPanel outcomes={outcomes} previousOutcomes={previousAnnualOutcome} selectedYear={selectedYear} successScore={successScore} previousSuccessScore={previousSuccessScore} />
      <section className="section-block">
        <h2>Annual Narrative Explanation</h2>
        <article className="year-narrative standalone-narrative">
          <strong>Year {selectedYear}</strong>
          <p>{selectedYearSuccessNarrative}</p>
          <p>{selectedNarrative}</p>
        </article>
      </section>
      <EntityPanels entities={selectedEntities} eventResponses={eventResponses} />
      <CollapsibleSection title="Active Feedback Loops">
        <FeedbackPanel feedback={selectedFeedback} explanations={selectedFeedbackExplanations} history={history} />
      </CollapsibleSection>
      <CollapsibleSection title="Key Drivers">
        <div className="explanation-grid">
          <ExplanationList title={`Year ${selectedYear} positive drivers`} items={selectedPositiveDrivers} />
          <ExplanationList title={`Year ${selectedYear} negative drivers`} items={selectedNegativeDrivers} />
          <ExplanationList title="Key trade-offs" items={tradeOffs} />
        </div>
      </CollapsibleSection>
    </>
  );
}
