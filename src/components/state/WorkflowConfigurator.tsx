import React, { useState } from 'react';
import { StateWorkflowConfiguration, StateWorkflowStep } from '../../types';
import { GitFork, CheckCircle2, Clock, ShieldAlert, UserCheck, ChevronRight, Layers } from 'lucide-react';

interface WorkflowConfiguratorProps {
  workflows: StateWorkflowConfiguration[];
  stateCode: string;
}

export const WorkflowConfigurator: React.FC<WorkflowConfiguratorProps> = ({
  workflows,
  stateCode
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number>(workflows[0]?.id || 1);

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  if (!activeWorkflow) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
        No workflow configurations available for {stateCode}.
      </div>
    );
  }

  const totalSLA = activeWorkflow.steps.reduce((sum, step) => sum + step.sla_days, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-teal-800" />
            <h3 className="font-extrabold text-slate-900 text-base">
              State Workflow Engine ({stateCode})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic stage sequencing, role delegations, SLA tracking, and auto-verification gates for land mutations.
          </p>
        </div>

        {/* Workflow Switcher */}
        <div className="flex items-center gap-2">
          {workflows.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWorkflowId(w.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedWorkflowId === w.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {w.workflow_type} ({w.version})
            </button>
          ))}
        </div>
      </div>

      {/* Active Workflow Overview Banner */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 text-sm">{activeWorkflow.workflow_name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
              {activeWorkflow.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{activeWorkflow.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Layers className="w-4 h-4 text-teal-700" />
            <span><strong>{activeWorkflow.steps.length}</strong> Configured Steps</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Total SLA: <strong>{totalSLA} Days</strong></span>
          </div>
        </div>
      </div>

      {/* Sequential Step Timeline */}
      <div className="mt-6 space-y-4">
        {activeWorkflow.steps.map((step, idx) => (
          <div
            key={step.step_order}
            className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-300 transition shadow-2xs relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {step.step_order}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {step.step_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-teal-700" />
                      Role: {step.responsible_role.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      SLA: {step.sla_days} Days
                    </span>
                    {step.approval_required ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Formal Approval Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Auto-Forward / Submission Gate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents & Auto Verification rules */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Required Input Documents
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {step.required_documents.map((doc, dIdx) => (
                    <span
                      key={dIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {step.auto_verification_rules && step.auto_verification_rules.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block mb-1">
                    Automated Verification Rule Engine
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {step.auto_verification_rules.map((rule, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-bold text-[10px] border border-teal-200"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
