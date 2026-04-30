// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { usePreferences } from "@/hooks/usePreferences"
import { getAllowedModels, getDefaultModelId } from "@/lib/allowedModels"
import { toast } from "sonner"
import { Check, Star, ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { sendWithEnter, setSendWithEnter, modelId, setModelId, composerModelId, setComposerModelId } = usePreferences()
  const allowed = useMemo(() => getAllowedModels(), [])
  const defaultId = useMemo(() => getDefaultModelId(), [])
  const [modelOpen, setModelOpen] = useState(false)
  const [overrideOpen, setOverrideOpen] = useState(false)

  // Silently drop stale modelId (admin may have removed it from config).
  useEffect(() => {
    if (modelId && allowed.length > 0 && !allowed.some((m) => m.modelId === modelId)) {
      setModelId(undefined)
    }
    if (composerModelId && allowed.length > 0 && !allowed.some((m) => m.modelId === composerModelId)) {
      setComposerModelId(undefined)
    }
  }, [modelId, composerModelId, allowed, setModelId, setComposerModelId])

  const selectedId = modelId ?? defaultId
  const selectedName = allowed.find((m) => m.modelId === selectedId)?.displayName ?? "Default"
  const composerName = composerModelId
    ? allowed.find((m) => m.modelId === composerModelId)?.displayName ?? "Default"
    : "Same as main"

  const onPick = (value: string) => {
    const m = allowed.find((a) => a.modelId === value)
    if (!m) return
    setModelId(m.modelId)
    toast.success(`Model changed to ${m.displayName}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        {/* ── Chat behavior (high-frequency, always visible) ── */}
        <section aria-labelledby="chat-heading" className="mt-2 px-4">
          <h3 id="chat-heading" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Chat behavior
          </h3>
          <button
            role="switch"
            aria-checked={sendWithEnter}
            onClick={() => setSendWithEnter(!sendWithEnter)}
            className="w-full flex items-center justify-between mt-3 py-1.5 text-sm text-foreground/80 hover:text-foreground motion-safe:transition-colors motion-safe:duration-150"
          >
            <span>Send with Enter</span>
            <span
              aria-hidden="true"
              className={[
                "relative w-8 h-[18px] rounded-full flex items-center px-0.5",
                "motion-safe:transition-colors motion-safe:duration-200",
                sendWithEnter ? "bg-brand-teal justify-end" : "bg-white/10 justify-start",
              ].join(" ")}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm motion-safe:transition-all motion-safe:duration-200" />
            </span>
          </button>
        </section>

        {/* ── Model (accordion, default collapsed) ── */}
        {allowed.length > 0 && (
          <section aria-labelledby="model-heading" className="mt-6 px-4">
            <button
              id="model-heading"
              onClick={() => setModelOpen(!modelOpen)}
              aria-expanded={modelOpen}
              className="w-full flex items-center justify-between py-1"
            >
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Model
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/70">{selectedName}</span>
                <ChevronDown className={[
                  "h-3.5 w-3.5 text-muted-foreground/50 motion-safe:transition-transform motion-safe:duration-200",
                  modelOpen ? "rotate-180" : "",
                ].join(" ")} />
              </div>
            </button>

            {modelOpen && (
              <div className="mt-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200">
                <p className="text-xs text-muted-foreground/70 mb-3">
                  Choose which AI model generates your slides.
                </p>
                <RadioGroupPrimitive.Root
                  value={selectedId}
                  onValueChange={onPick}
                  aria-label="Select AI model"
                  className="space-y-1.5"
                >
                  {allowed.map((m) => {
                    const isSelected = selectedId === m.modelId
                    const isDefault = m.modelId === defaultId
                    return (
                      <RadioGroupPrimitive.Item
                        key={m.modelId}
                        value={m.modelId}
                        className={[
                          "group w-full text-left rounded-lg border p-3 outline-none",
                          "motion-safe:transition-[border-color,background-color] motion-safe:duration-150",
                          "focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                          isSelected
                            ? "border-brand-teal/60 bg-brand-teal-soft"
                            : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className={[
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              "motion-safe:transition-colors motion-safe:duration-150",
                              isSelected
                                ? "border-brand-teal bg-brand-teal"
                                : "border-white/20 group-hover:border-white/30",
                            ].join(" ")}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{m.displayName}</span>
                              {isDefault && (
                                <span
                                  className="inline-flex items-center gap-0.5 rounded-full bg-brand-teal/10 px-1.5 py-px text-[10px] font-medium text-brand-teal"
                                  aria-label="Recommended"
                                >
                                  <Star className="h-2.5 w-2.5" />
                                  Recommended
                                </span>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{m.description}</p>
                            )}
                          </div>
                        </div>
                      </RadioGroupPrimitive.Item>
                    )
                  })}
                </RadioGroupPrimitive.Root>

                {/* Per-agent override (nested accordion) */}
                <div className="mt-4">
                  <button
                    onClick={() => setOverrideOpen(!overrideOpen)}
                    aria-expanded={overrideOpen}
                    className="w-full flex items-center justify-between py-1 text-xs text-muted-foreground/60 hover:text-muted-foreground/80 motion-safe:transition-colors"
                  >
                    <span>Per-agent override</span>
                    <ChevronDown className={[
                      "h-3 w-3 motion-safe:transition-transform motion-safe:duration-200",
                      overrideOpen ? "rotate-180" : "",
                    ].join(" ")} />
                  </button>

                  {overrideOpen && (
                    <div className="mt-2 space-y-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150">
                      {/* Composer model */}
                      <div>
                        <label htmlFor="composer-model" className="text-xs text-muted-foreground/70">
                          Composer
                        </label>
                        <select
                          id="composer-model"
                          value={composerModelId ?? ""}
                          onChange={(e) => setComposerModelId(e.target.value || undefined)}
                          className="mt-1 w-full rounded-md border border-white/[0.08] bg-transparent px-3 py-1.5 text-sm text-foreground outline-none focus:border-brand-teal/40"
                        >
                          <option value="">Same as main</option>
                          {allowed.map((m) => (
                            <option key={m.modelId} value={m.modelId}>{m.displayName}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          Model used for slide composition. Defaults to the main model.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </SheetContent>
    </Sheet>
  )
}
