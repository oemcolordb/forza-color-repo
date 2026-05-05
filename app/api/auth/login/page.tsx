'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type CornerPhase = 'entry' | 'mid' | 'exit';
type Symptom = 'understeer' | 'oversteer';

const diagnosticsData = {
  entry: {
    understeer: {
      description: "Feels like the car is resisting input when turning into the corner off-throttle or under braking.",
      fixes: [
        "Adjust tire pressure",
        "Lower front springs/ARBs",
        "Increase toe-out in front/rear",
        "Increase front downforce",
        "Lower diff decel lock",
        "Increase front bump",
        "Decrease front rebound"
      ]
    },
    oversteer: {
      description: "The rear slides out when entering corners or applying the brakes.",
      fixes: [
        "Increase front springs/ARBs",
        "Lower rear springs/ARBs",
        "Decrease front toe-out",
        "Increase rear toe-in",
        "Lower front downforce",
        "Increase diff decel lock"
      ]
    }
  },
  mid: {
    understeer: {
      description: "The car won't turn enough while coasting or maintaining speed in the middle of a corner.",
      fixes: [
        "Lower front ARBs",
        "Increase rear ARBs",
        "Lower front springs",
        "Increase rear springs",
        "Increase front toe-out",
        "Decrease rear toe-in",
        "Increase front downforce"
      ]
    },
    oversteer: {
      description: "The rear starts sliding while maintaining speed mid-corner.",
      fixes: [
        "Increase rear ARBs",
        "Lower front ARBs",
        "Increase rear springs",
        "Lower front springs",
        "Decrease front toe-out",
        "Increase rear toe-in"
      ]
    }
  },
  exit: {
    understeer: {
      description: "The car pushes wide when you get on the throttle to exit a corner.",
      fixes: [
        "Lower diff accel lock",
        "Increase rear springs/ARBs",
        "Lower front springs/ARBs",
        "Adjust brake balance forward",
        "Increase rear downforce"
      ]
    },
    oversteer: {
      description: "The rear loses traction and slides out under acceleration.",
      fixes: [
        "Increase diff accel lock",
        "Lower rear springs/ARBs",
        "Increase front springs/ARBs",
        "Adjust brake balance rearward",
        "Lower rear downforce"
      ]
    }
  }
};

export default function TuningDiagnosticTool() {
  const [phase, setPhase] = useState<CornerPhase>('entry');
  const [symptom, setSymptom] = useState<Symptom>('understeer');

  const currentDiagnostic = diagnosticsData[phase][symptom];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Tuning Diagnostic Tool 🔧
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Having handling issues? Select where your car is struggling in the corner and what it is doing to get instant setup adjustments.
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          {/* Phase Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              1. Corner Phase
            </label>
            <div className="flex bg-gray-100 dark:bg-slate-900 rounded-lg p-1">
              {(['entry', 'mid', 'exit'] as CornerPhase[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPhase(p)}
                  className={`flex-1 py-2 text-sm font-semibold capitalize rounded-md transition-all ${
                    phase === p
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              2. Symptom
            </label>
            <div className="flex bg-gray-100 dark:bg-slate-900 rounded-lg p-1">
              {(['understeer', 'oversteer'] as Symptom[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSymptom(s)}
                  className={`flex-1 py-2 text-sm font-semibold capitalize rounded-md transition-all ${
                    symptom === s
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transform transition-all duration-300">
          <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
              {phase} {symptom} Diagnosis
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{currentDiagnostic.description}</p>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Recommended Adjustments (Make 1-2 clicks at a time)
            </h3>
            <ul className="space-y-3">
              {currentDiagnostic.fixes.map((fix, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 dark:text-slate-200 font-medium">
                    {fix}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center pt-8">
           <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
             &larr; Back to Home
           </Link>
        </div>

      </div>
    </div>
  );
}
