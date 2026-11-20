import React, { useState } from 'react';
import { 
  Grid, AlertTriangle, Users, BookOpen, ChevronRight, 
  Sparkles, ShieldAlert, CheckCircle2 
} from 'lucide-react';

const GRADES = [9, 10, 11, 12];
const SECTIONS = ['A', 'B', 'C'];

export default function SchoolRiskHeatmap({ riskList, onSelectStudent, t }) {
  const [selectedCell, setSelectedCell] = useState({ grade: 10, section: 'A' });

  // Calculate cell statistics
  const getCellStats = (grade, section) => {
    const students = riskList.filter(s => s.grade === grade && s.section === section);
    const count = students.length;
    if (count === 0) return { count: 0, highCount: 0, medCount: 0, highPct: 0, avgRisk: 0, students: [] };

    const highCount = students.filter(s => s.risk_tier === 'High').length;
    const medCount = students.filter(s => s.risk_tier === 'Medium').length;
    const highPct = Math.round((highCount / count) * 100);
    const avgRisk = Math.round((students.reduce((acc, s) => acc + s.risk_probability, 0) / count) * 100);

    return { count, highCount, medCount, highPct, avgRisk, students };
  };

  const getHeatmapColor = (highPct) => {
    if (highPct >= 50) return 'bg-rose-500 text-white hover:bg-rose-600 border-rose-600';
    if (highPct >= 30) return 'bg-orange-500 text-white hover:bg-orange-600 border-orange-600';
    if (highPct >= 15) return 'bg-amber-400 text-slate-900 hover:bg-amber-500 border-amber-500';
    return 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600';
  };

  const activeCellStats = getCellStats(selectedCell.grade, selectedCell.section);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">Intelligent School Risk Heatmap</h2>
        </div>
        <p className="text-xs text-slate-500">
          Multi-dimensional matrix mapping dropout risk intensity across Grades and Sections. Click any cell to inspect section cohort.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Heatmap Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Grade × Section Cohort Density</h3>
            {/* Color Legend */}
            <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center"><span className="w-3 h-3 rounded bg-emerald-500 mr-1" /> &lt;15%</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded bg-amber-400 mr-1" /> 15-30%</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded bg-orange-500 mr-1" /> 30-50%</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded bg-rose-500 mr-1" /> &gt;50% High</span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase text-left w-24">Grade</th>
                  {SECTIONS.map(sec => (
                    <th key={sec} className="p-3 text-xs font-bold text-slate-700 uppercase">
                      Section {sec}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GRADES.map(grade => (
                  <tr key={grade}>
                    <td className="p-3 font-bold text-slate-800 text-sm text-left">
                      Grade {grade}
                    </td>
                    {SECTIONS.map(section => {
                      const stats = getCellStats(grade, section);
                      const isSelected = selectedCell.grade === grade && selectedCell.section === section;

                      return (
                        <td key={section} className="p-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCell({ grade, section })}
                            className={`w-full h-24 rounded-2xl border transition-all p-2.5 flex flex-col justify-between items-center text-center cursor-pointer shadow-xs ${getHeatmapColor(stats.highPct)} ${
                              isSelected ? 'ring-4 ring-indigo-500/30 scale-102 font-bold shadow-md' : 'opacity-95'
                            }`}
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
                              {stats.count} Students
                            </div>
                            <div className="text-xl sm:text-2xl font-black">
                              {stats.highPct}%
                            </div>
                            <div className="text-[10px] font-medium opacity-90">
                              {stats.highCount} at high risk
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Section Drill-Down (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Grade {selectedCell.grade} – Section {selectedCell.section} Cohort
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCellStats.count} Enrolled • Average Section Risk: {activeCellStats.avgRisk}%
                </p>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {activeCellStats.highCount} High
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {activeCellStats.medCount} Med
                </span>
              </div>
            </div>

            {/* Students List in this Section */}
            <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {activeCellStats.students.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No students in this section.
                </div>
              ) : (
                activeCellStats.students.map((stu) => (
                  <div
                    key={stu.student_id}
                    onClick={() => onSelectStudent(stu.student_id)}
                    className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {stu.student_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {stu.student_id} • p = {stu.risk_probability}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stu.risk_tier === 'High' ? 'bg-rose-100 text-rose-800' :
                        stu.risk_tier === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {Math.round(stu.risk_probability * 100)}%
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
            *Click on any student card above to open their detailed SHAP explanation and What-If simulator.
          </div>
        </div>
      </div>
    </div>
  );
}
