import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesApi } from '../api/cases.api.js';
import { documentsApi } from '../api/documents.api.js';
import { evidenceApi } from '../api/evidence.api.js';
import { predictionsApi } from '../api/predictions.api.js';
import Card, { CardBody, CardHeader } from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const strengthColors = { strong: 'green', medium: 'yellow', weak: 'red' };

export default function AnalysisPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      casesApi.getById(id),
      documentsApi.listByCaseId(id).catch(() => ({ documents: [] })),
      evidenceApi.listByCaseId(id).catch(() => ({ evidence: [] })),
      predictionsApi.listByCaseId(id).catch(() => ({ predictions: [] })),
    ]).then(([c, d, e, p]) => {
      setCaseData(c.case || c);
      setDocuments(d.documents || []);
      setEvidence(e.evidence || []);
      setPredictions(p.predictions || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!caseData) return <p className="text-gray-500">Case not found.</p>;

  const latestPrediction = predictions[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            <Link to={`/cases/${id}`} className="text-blue-600 hover:underline">Back to Case</Link>
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Analysis Report</h1>
          <p className="text-sm text-gray-500">{caseData.caseNumber} - {caseData.title}</p>
        </div>
      </div>

      {/* Summary */}
      {caseData.aiSummary && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">Case Summary</h3></CardHeader>
          <CardBody><p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{caseData.aiSummary}</p></CardBody>
        </Card>
      )}

      {/* Key Facts */}
      {caseData.aiKeyFacts?.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">Key Facts</h3></CardHeader>
          <CardBody>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              {caseData.aiKeyFacts.map((fact, i) => <li key={i}>{fact}</li>)}
            </ol>
          </CardBody>
        </Card>
      )}

      {/* Evidence Summary */}
      {evidence.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">Evidence ({evidence.length} items)</h3></CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Strength</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evidence.map((ev) => (
                  <tr key={ev._id}>
                    <td className="px-4 py-2 font-medium">{ev.title}</td>
                    <td className="px-4 py-2">
                      {ev.strength && <Badge color={strengthColors[ev.strength]}>{ev.strength}</Badge>}
                    </td>
                    <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{ev.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Timeline */}
      {caseData.aiTimeline?.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">Timeline</h3></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {caseData.aiTimeline.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0 w-28 text-center">
                    {item.date}
                  </span>
                  <p className="text-sm text-gray-700">{item.event}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Prediction */}
      {latestPrediction && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">AI Prediction</h3></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Predicted Outcome</p>
                <p className="text-xl font-bold text-blue-700">{latestPrediction.predictedOutcome}</p>
              </div>
              {latestPrediction.confidenceScore != null && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{(latestPrediction.confidenceScore * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Confidence</p>
                </div>
              )}
            </div>
            {latestPrediction.reasoning && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{latestPrediction.reasoning}</p>
            )}
            {latestPrediction.relevantLaws?.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-1">Relevant Laws</h5>
                <div className="flex flex-wrap gap-1">
                  {latestPrediction.relevantLaws.map((l, i) => <Badge key={i} color="blue">{l}</Badge>)}
                </div>
              </div>
            )}
            {latestPrediction.riskFactors?.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-1">Risk Factors</h5>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {latestPrediction.riskFactors.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">{latestPrediction.disclaimer}</p>
          </CardBody>
        </Card>
      )}

      {/* Legal References */}
      {caseData.aiTags?.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-lg">Legal References</h3></CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {caseData.aiTags.map((tag, i) => <Badge key={i} color="blue">{tag}</Badge>)}
            </div>
          </CardBody>
        </Card>
      )}

      {!caseData.aiSummary && !latestPrediction && (
        <Card>
          <CardBody>
            <p className="text-center text-gray-400 py-8">
              No analysis data available. Go to the case detail page and click "Run AI Analysis" first.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
