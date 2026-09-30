"use client";

import { useState } from "react";
import { SOPDefinition, SOPStep, SOPRule } from "@/types/sop";
import { CLASSIFICATION_DICTIONARY } from "@/lib/classification/dictionary";
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Layers,
  AlertCircle,
  ArrowRight,
  Download,
} from "lucide-react";

interface SopBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sop: SOPDefinition) => void;
  onDelete?: (sopId: string) => void;
  initialSop?: SOPDefinition | null;
}

const AVAILABLE_TYPES = CLASSIFICATION_DICTIONARY.map((d) => ({
  type: d.type,
  label: d.label,
}));

function SopBuilderForm({
  onClose,
  onSave,
  onDelete,
  initialSop,
}: Omit<SopBuilderModalProps, "isOpen">) {
  const [name, setName] = useState(() => initialSop?.name || "Custom Compliance Dossier");
  const [description, setDescription] = useState(
    () => initialSop?.description || "User-configured procedural ordering and verification checklist."
  );
  const [category, setCategory] = useState(() => initialSop?.category || "Custom");
  const [steps, setSteps] = useState<SOPStep[]>(() => {
    if (initialSop?.steps) {
      return JSON.parse(JSON.stringify(initialSop.steps));
    }
    return [
      {
        id: "step-1",
        name: "Initial Application / Intake",
        order: 1,
        documentTypes: ["application"],
        required: true,
        maxAllowed: 1,
      },
      {
        id: "step-2",
        name: "Verification & Compliance Proof",
        order: 2,
        documentTypes: ["identity-proof", "verification"],
        required: true,
        maxAllowed: 2,
      },
      {
        id: "step-3",
        name: "Management Approval",
        order: 3,
        documentTypes: ["approval"],
        required: true,
        maxAllowed: 1,
      },
      {
        id: "step-4",
        name: "Final Contract & Sign-off",
        order: 4,
        documentTypes: ["final-decision"],
        required: true,
        maxAllowed: 1,
      },
    ];
  });

  const [rules, setRules] = useState<SOPRule[]>(() => {
    if (initialSop?.rules) {
      return JSON.parse(JSON.stringify(initialSop.rules));
    }
    return [
      {
        type: "before",
        before: "step-1",
        after: "step-2",
        description: "Step 1 must precede Step 2",
      },
    ];
  });

  const [customTagInput, setCustomTagInput] = useState<{ [stepIndex: number]: string }>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Add a new blank step
  const handleAddStep = () => {
    const nextOrder = steps.length + 1;
    const newId = `custom-step-${Date.now().toString(36)}`;
    setSteps([
      ...steps,
      {
        id: newId,
        name: `Step ${nextOrder} Title`,
        order: nextOrder,
        documentTypes: [],
        required: false,
        maxAllowed: 1,
      },
    ]);
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      setValidationError("An SOP must contain at least one procedural step.");
      return;
    }
    const removedStep = steps[index];
    const filtered = steps.filter((_, i) => i !== index);
    // Renumber remaining steps
    const renumbered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(renumbered);
    // Remove orphaned rules pointing to this step
    setRules((prev) =>
      prev.filter((r) => r.before !== removedStep.id && r.after !== removedStep.id)
    );
  };

  // Reorder steps up/down
  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const copy = [...steps];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Update order numbers
    const renumbered = copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(renumbered);
  };

  // Update step field
  const handleUpdateStep = (index: number, field: Partial<SOPStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...field };
    setSteps(updated);
  };

  // Tag / document type addition
  const handleAddTagToStep = (index: number, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!cleanTag) return;

    const currentTypes = steps[index].documentTypes || [];
    if (!currentTypes.includes(cleanTag)) {
      handleUpdateStep(index, { documentTypes: [...currentTypes, cleanTag] });
    }
  };

  const handleRemoveTagFromStep = (index: number, tagToRemove: string) => {
    const currentTypes = steps[index].documentTypes || [];
    handleUpdateStep(index, {
      documentTypes: currentTypes.filter((t) => t !== tagToRemove),
    });
  };

  // Add dependency rule
  const handleAddRule = () => {
    if (steps.length < 2) return;
    setRules([
      ...rules,
      {
        type: "before",
        before: steps[0].id,
        after: steps[1].id,
        description: `${steps[0].name} must precede ${steps[1].name}`,
      },
    ]);
  };

  // Save the custom SOP
  const handleSave = () => {
    if (!name.trim()) {
      setValidationError("Please enter an SOP name.");
      return;
    }
    if (steps.length === 0) {
      setValidationError("Please add at least one step.");
      return;
    }

    const sopId =
      initialSop?.id || `sop-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const customSop: SOPDefinition = {
      id: sopId,
      name: name.trim(),
      description: description.trim() || "User defined customized workflow sequence.",
      category: category.trim() || "Custom",
      isCustom: true,
      steps: steps.map((s, idx) => ({ ...s, order: idx + 1 })),
      rules,
    };

    onSave(customSop);
    onClose();
  };

  // Export current SOP as JSON
  const handleExportJson = () => {
    const exportData = {
      id: initialSop?.id || `custom-sop-${Date.now()}`,
      name,
      description,
      category,
      steps,
      rules,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-sop.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg dark:text-white">
                {initialSop?.isCustom ? "Edit Custom SOP Rulebook" : "Custom SOP Builder"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the sequence stages, mandatory documents, and precedence rules for your workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: SOP Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block dark:text-slate-300">
                SOP Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Healthcare Clinical Trial Dossier"
                className="w-full text-xs sm:text-sm font-medium rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block dark:text-slate-300">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Operations, Legal"
                className="w-full text-xs sm:text-sm font-medium rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block dark:text-slate-300">
                Description / Compliance Scope
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Briefly describe what this document package verifies..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Stages / Steps Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sequence Stages ({steps.length} Steps)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arranged from Stage 1 to N. The ordering engine will group and file documents in this exact order.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id || index}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-colors dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-xs font-bold dark:bg-white dark:text-slate-900">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleUpdateStep(index, { name: e.target.value })}
                        placeholder="Stage Name (e.g. Identity Proof)"
                        className="flex-1 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveStep(index, "up")}
                        disabled={index === 0}
                        title="Move Stage Earlier"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        title="Move Stage Later"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        title="Delete Stage"
                        className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ml-1 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Settings row: Mandatory & Max Allowed */}
                  <div className="flex items-center gap-4 text-xs flex-wrap pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={step.required ?? false}
                        onChange={(e) => handleUpdateStep(index, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mandatory Stage (Triggers alert if missing)</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Max allowed docs:</span>
                      <select
                        value={step.maxAllowed || 1}
                        onChange={(e) =>
                          handleUpdateStep(index, { maxAllowed: parseInt(e.target.value, 10) })
                        }
                        className="text-xs font-semibold rounded-md border border-slate-300 bg-white py-1 px-2 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        <option value="1">1 (Single doc)</option>
                        <option value="2">2 (Up to 2)</option>
                        <option value="4">4 (Up to 4)</option>
                        <option value="10">10 (Multi-file)</option>
                      </select>
                    </div>
                  </div>

                  {/* Matching Document Types / Keywords */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                        Matching Document Types & Keywords
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {step.documentTypes.map((typeTag) => (
                        <span
                          key={typeTag}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <span>{typeTag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromStep(index, typeTag)}
                            className="text-slate-400 hover:text-red-500 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {/* Add quick preset dropdown */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddTagToStep(index, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="text-[11px] rounded-md border border-dashed border-slate-300 bg-transparent py-0.5 px-2 text-slate-600 hover:border-slate-400 cursor-pointer dark:border-slate-700 dark:text-slate-400"
                      >
                        <option value="">+ Pick preset type...</option>
                        {AVAILABLE_TYPES.map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label} ({t.type})
                          </option>
                        ))}
                      </select>

                      {/* Custom tag input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customTagInput[index] || ""}
                          onChange={(e) =>
                            setCustomTagInput({ ...customTagInput, [index]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTagToStep(index, customTagInput[index] || "");
                              setCustomTagInput({ ...customTagInput, [index]: "" });
                            }
                          }}
                          placeholder="or type custom keyword + enter"
                          className="text-[11px] rounded-md border border-slate-200 px-2 py-0.5 bg-slate-50 w-44 focus:bg-white focus:outline-hidden dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Dependency Precedence Rules */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prerequisite Rules ({rules.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enforce strict ordering between prerequisite stages regardless of extracted dates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRule}
                disabled={steps.length < 2}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            {rules.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800">
                No explicit dependency rules set. The engine will default strictly to Stage 1 &rarr; Stage N ordering.
              </p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 text-xs dark:bg-amber-950/20 dark:border-amber-900/50"
                  >
                    <div className="flex items-center gap-2 flex-wrap flex-1 text-slate-800 dark:text-slate-200">
                      <span className="font-semibold">Prerequisite:</span>
                      <select
                        value={rule.before}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[rIdx] = { ...updated[rIdx], before: e.target.value };
                          setRules(updated);
                        }}
                        className="rounded border border-amber-300 bg-white px-2 py-1 font-medium text-xs dark:bg-slate-800 dark:border-amber-900"
                      >
                        {steps.map((s) => (
                          <option key={s.id} value={s.id}>
                            Step {s.order}: {s.name}
                          </option>
                        ))}
                      </select>
                      <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
                      <span className="font-semibold">Must precede:</span>
                      <select
                        value={rule.after}
                        onChange={(e) => {
                          const updated = [...rules];
                          updated[rIdx] = { ...updated[rIdx], after: e.target.value };
                          setRules(updated);
                        }}
                        className="rounded border border-amber-300 bg-white px-2 py-1 font-medium text-xs dark:bg-slate-800 dark:border-amber-900"
                      >
                        {steps.map((s) => (
                          <option key={s.id} value={s.id}>
                            Step {s.order}: {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRules(rules.filter((_, i) => i !== rIdx))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            {initialSop?.isCustom && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${initialSop.name}"?`)) {
                    onDelete(initialSop.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors dark:bg-red-950/40 dark:border-red-900 dark:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete SOP</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save & Apply SOP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SopBuilderModal(props: SopBuilderModalProps) {
  if (!props.isOpen) return null;

  return (
    <SopBuilderForm
      key={props.initialSop?.id || "new-sop-form"}
      onClose={props.onClose}
      onSave={props.onSave}
      onDelete={props.onDelete}
      initialSop={props.initialSop}
    />
  );
}
