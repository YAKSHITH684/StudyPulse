import React, { useState } from 'react';
import { 
  Database, RefreshCw, UploadCloud, Play, Sparkles, 
  CheckCircle2, AlertTriangle, FileSpreadsheet, ShieldCheck 
} from 'lucide-react';
import { api } from '../api';

export default function DataPipelineHub({ onPipelineSuccess, t }) {
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [generatingData, setGeneratingData] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetType, setDatasetType] = useState('students');

  const handleGenerateSynthetic = async () => {
    setGeneratingData(true);
    setPipelineOutput(null);
    try {
      const res = await api.generateSynthetic(250, 8);
      // Automatically trigger pipeline run after generating data
      const pipeRes = await api.runPipeline();
      setPipelineOutput({
        ...pipeRes,
        syntheticMessage: res.message
      });
      onPipelineSuccess();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setGeneratingData(false);
    }
  };

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    setPipelineOutput(null);
    try {
      const res = await api.runPipeline();
      setPipelineOutput(res);
      onPipelineSuccess();
    } catch (err) {
      alert("Error running pipeline: " + err.message);
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadStatus({ loading: true });
    try {
      const res = await api.uploadCsv(selectedFile, datasetType);
      setUploadStatus({ success: true, message: `Successfully loaded ${res.rows_inserted} rows of ${res.dataset_type} data!` });
      setSelectedFile(null);
    } catch (err) {
      setUploadStatus({ error: err.message || "Failed to upload CSV" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">Data Management & ML Pipeline Automation</h2>
        </div>
        <p className="text-xs text-slate-500">
          Control synthetic multi-week data generation, CSV ingestion, feature extraction, and XGBoost + SHAP model re-scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Pipeline Triggers */}
        <div className="space-y-4">
          {/* Card 1: Re-Run ML Pipeline */}
          <div className="bg-gradient-to-br from-sky-50/50 via-white to-white p-6 rounded-2xl border border-sky-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-sky-100 rounded-xl text-sky-700">
                <Play className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded">
                Live Re-Scoring
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Run AI Risk & SHAP Pipeline</h3>
            <p className="text-xs text-slate-500">
              Extracts 4-week trend features across attendance, marks, behavior, and engagement, retrains the XGBoost classifier, and generates SHAP explanations for all enrolled students.
            </p>
            <button
              onClick={handleRunPipeline}
              disabled={runningPipeline}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${runningPipeline ? 'animate-spin' : ''}`} />
              <span>{runningPipeline ? 'Processing ML Pipeline...' : 'Run Prediction Pipeline'}</span>
            </button>
          </div>

          {/* Card 2: Generate Synthetic Dataset */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-white p-6 rounded-2xl border border-indigo-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                Reproducible Seed (42)
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Generate Synthetic School Dataset</h3>
            <p className="text-xs text-slate-500">
              Populates 250 realistic student profiles over 8 weeks with synthetic multi-subject marks, attendance records, behavior incidents, and low-confidence missing data cases.
            </p>
            <button
              onClick={handleGenerateSynthetic}
              disabled={generatingData}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <Database className={`w-4 h-4 ${generatingData ? 'animate-spin' : ''}`} />
              <span>{generatingData ? 'Synthesizing & Training...' : 'Generate New 250-Student Dataset'}</span>
            </button>
          </div>
        </div>

        {/* Right: CSV Ingestion & Output Console */}
        <div className="space-y-4">
          {/* CSV File Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">Upload Custom CSV Data</h3>
            </div>
            <p className="text-xs text-slate-500">
              Upload custom school records (CSV format). The system validates headers and merges records into the database.
            </p>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dataset Type</label>
                <select
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="students">Students Master CSV (student_id, name, grade, section)</option>
                  <option value="attendance">Weekly Attendance CSV (student_id, week_number, days_present)</option>
                  <option value="marks">Weekly Marks CSV (student_id, week_number, subject, score)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select .csv File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {uploadStatus?.message && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-medium">
                  {uploadStatus.message}
                </div>
              )}
              {uploadStatus?.error && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl font-medium">
                  {uploadStatus.error}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || uploadStatus?.loading}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-xl font-bold transition-colors"
              >
                {uploadStatus?.loading ? 'Uploading & Validating...' : 'Upload & Merge CSV'}
              </button>
            </form>
          </div>

          {/* Pipeline Results Console */}
          {pipelineOutput && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Pipeline Execution Successful
                </span>
                <span className="text-slate-500 text-[10px]">FastAPI ML Runner</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                {pipelineOutput.syntheticMessage && (
                  <p className="text-sky-300">• {pipelineOutput.syntheticMessage}</p>
                )}
                <p>• Students Scored: <strong>{pipelineOutput.students_scored}</strong></p>
                <p>• High Risk Flagged: <strong className="text-rose-400">{pipelineOutput.high_risk_count}</strong></p>
                <p>• Medium Risk Watchlist: <strong className="text-amber-400">{pipelineOutput.medium_risk_count}</strong></p>
                <p>• Low Risk On-Track: <strong className="text-emerald-400">{pipelineOutput.low_risk_count}</strong></p>
                <p>• High-Risk Recall: <strong>{(pipelineOutput.metrics.high_risk_recall * 100).toFixed(1)}%</strong></p>
                <p>• Model Version: <strong>{pipelineOutput.metrics.model_version}</strong></p>
                <p className="text-slate-400 pt-1">• Exactly 3 SHAP reasons computed for every student.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
