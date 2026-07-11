import type { OutcomeScores } from '../simulation/model';
import { formatMoney, formatNumber, formatPercent } from './formatters';

type NationalReport = {
  department: string;
  summary: string;
  majorConcerns: string[];
  majorImprovements: string[];
  trend: 'Improving' | 'Stable' | 'Under pressure';
  recommendations: string[];
};

export function NationalReports({
  outcomes,
  selectedYear,
}: {
  outcomes: OutcomeScores;
  selectedYear: number;
}) {
  const reports = buildNationalReports(outcomes);

  return (
    <section className="section-block national-reports-section">
      <div className="national-reports-header">
        <p className="eyebrow">National Reports</p>
        <h2>Year {selectedYear} cabinet briefing papers</h2>
        <p>
          Departments summarise the latest enacted national results. These reports use the existing
          simulator calculations and do not include pending policy changes until you press End Year.
        </p>
      </div>
      <div className="national-report-grid">
        {reports.map((report) => (
          <article className="national-report-card" key={report.department}>
            <div className="report-card-header">
              <span>{report.department}</span>
              <strong className={`report-trend ${trendClass(report.trend)}`}>{report.trend}</strong>
            </div>
            <p>{report.summary}</p>
            <ReportList title="Major concerns" items={report.majorConcerns} />
            <ReportList title="Major improvements" items={report.majorImprovements} />
            <ReportList title="Recommendations" items={report.recommendations} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="report-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function buildNationalReports(outcomes: OutcomeScores): NationalReport[] {
  const employmentProxy = clamp(
    outcomes.economicGrowth * 8 + outcomes.wellbeing * 0.35 + outcomes.socialCohesion * 0.25,
    0,
    100,
  );

  return [
    {
      department: 'Treasury',
      summary: `Growth is ${formatPercent(outcomes.economicGrowth)} and the simplified budget balance is ${formatMoney(outcomes.governmentBalance)}.`,
      majorConcerns: [
        outcomes.governmentBalance < 0
          ? 'Budget remains in deficit, limiting room for future spending.'
          : 'Budget position is positive, but future shocks could reduce fiscal room.',
        outcomes.housingStress > 60
          ? 'Housing stress may drag on household confidence and productivity.'
          : 'Housing pressure is not the dominant fiscal risk this year.',
      ],
      majorImprovements: [
        outcomes.economicGrowth >= 2
          ? 'Economic activity is supporting revenue capacity.'
          : 'Low growth is keeping the revenue outlook cautious.',
        outcomes.governmentBalance >= 0
          ? 'Revenue is currently above spending in the simplified balance.'
          : 'Some revenue drivers are still offsetting part of the spending pressure.',
      ],
      trend: outcomes.governmentBalance >= 0 && outcomes.economicGrowth >= 2 ? 'Improving' : outcomes.governmentBalance < -80 ? 'Under pressure' : 'Stable',
      recommendations: [
        'Protect fiscal buffers before expanding permanent programs.',
        'Check whether growth gains are arriving with housing or environmental trade-offs.',
      ],
    },
    {
      department: 'Housing',
      summary: `Estimated new household demand is ${formatNumber(outcomes.housingDemand)} homes and housing stress is ${outcomes.housingStress.toFixed(1)}.`,
      majorConcerns: [
        outcomes.housingGap > 0
          ? `Demand is above effective supply by about ${formatNumber(outcomes.housingGap)} homes.`
          : 'Construction is broadly keeping pace with estimated new demand.',
        outcomes.fairness < 60
          ? 'Renters and young workers are carrying more of the pressure.'
          : 'Distributional pressure is manageable in the current enacted results.',
      ],
      majorImprovements: [
        outcomes.housingBuildCapacityScore >= 70
          ? 'Housing build capacity is comparatively strong.'
          : 'There is room to strengthen construction capacity.',
        outcomes.housingStress < 45
          ? 'Housing stress is contained for this scenario year.'
          : 'Housing stress is visible and needs monitoring.',
      ],
      trend: outcomes.housingStress < 45 ? 'Improving' : outcomes.housingStress > 70 ? 'Under pressure' : 'Stable',
      recommendations: [
        'Coordinate housing supply with migration and infrastructure decisions.',
        'Watch fairness impacts on renters, students and young workers.',
      ],
    },
    {
      department: 'Environment',
      summary: `Environmental pressure is ${outcomes.environmentalPressure.toFixed(1)} on the simulator scale, where lower is better.`,
      majorConcerns: [
        outcomes.environmentalPressure > 65
          ? 'Environmental systems are under high pressure from growth, population and event effects.'
          : 'Environmental pressure is present but not yet severe.',
        outcomes.economicGrowth > 3
          ? 'Strong activity may increase resource use without offsetting policy action.'
          : 'Moderate activity is limiting additional environmental pressure.',
      ],
      majorImprovements: [
        outcomes.environmentalPressure < 45
          ? 'Environmental pressure is comparatively contained.'
          : 'There is still scope to lower emissions and resource pressure.',
        outcomes.absorptiveCapacityScore >= 70
          ? 'Strong capacity makes it easier to adapt infrastructure and services.'
          : 'Lower capacity makes environmental adaptation harder.',
      ],
      trend: outcomes.environmentalPressure < 45 ? 'Improving' : outcomes.environmentalPressure > 65 ? 'Under pressure' : 'Stable',
      recommendations: [
        'Pair growth measures with environmental safeguards.',
        'Plan resilience spending before climate or infrastructure shocks arrive.',
      ],
    },
    {
      department: 'Employment',
      summary: `Employment conditions are represented through growth, wellbeing and cohesion. The current labour-market proxy is ${employmentProxy.toFixed(1)}.`,
      majorConcerns: [
        outcomes.economicGrowth < 1.5
          ? 'Weak growth may reduce hiring confidence.'
          : 'Growth is supporting labour demand, but skills matching still matters.',
        outcomes.socialCohesion < 55
          ? 'Lower cohesion can make workforce integration harder.'
          : 'Social cohesion is supporting workforce participation.',
      ],
      majorImprovements: [
        outcomes.wellbeing >= 65
          ? 'Household wellbeing is supporting participation and confidence.'
          : 'Wellbeing remains a constraint on broad participation.',
        outcomes.absorptiveCapacityScore >= 65
          ? 'Infrastructure, skills and integration settings are helping labour absorption.'
          : 'Capacity constraints may limit employment gains from population growth.',
      ],
      trend: employmentProxy >= 65 ? 'Improving' : employmentProxy < 45 ? 'Under pressure' : 'Stable',
      recommendations: [
        'Match migration and education settings to skill shortages.',
        'Monitor whether housing stress is undermining workforce mobility.',
      ],
    },
  ];
}

function trendClass(trend: NationalReport['trend']) {
  if (trend === 'Improving') return 'is-improving';
  if (trend === 'Under pressure') return 'is-pressure';
  return 'is-stable';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
