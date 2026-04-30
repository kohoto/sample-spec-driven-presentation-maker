// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { usePreferences } from "@/hooks/usePreferences"
import { getAllowedModels, getDefaultModelId } from "@/lib/allowedModels"
import { toast } from "sonner"
import { Check, Sparkles } from "lucide-react"
import { useEffect, useMemo } from "react"

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { sendWithEnter, setSendWithEnter, modelId, setModelId, composerModelId, setComposerModelId } = usePreferences()
  const allowed = useMemo(() => getAllowedModels(), [])
  const defaultId = useMemo(() => getDefaultModelId(), [])

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

  const onPick = (value: string) => {
    const m = allowed.find((a) => a.modelId === value)
    if (!m) return
    setModelId(m.modelId)
    toast.success(`Model changed to ${m.displayName}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[460px] overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-lg">Settings</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-5 pb-6">
          {/* ── Chat behavior ── */}
          <section
            aria-labelledby="chat-heading"
            className="rounded-xl border border-white/[0.06] bg-card/40 p-4"
          >
            <h3
              id="chat-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
            >
              Chat
            </h3>
            <label
              htmlFor="send-with-enter"
              className="flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">Send with Enter</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Press Enter to send. Shift+Enter for a new line.
                </div>
              </div>
              <Switch
                id="send-with-enter"
                checked={sendWithEnter}
                onCheckedChange={setSendWithEnter}
              />
            </label>
          </section>

          {/* ── Model ── */}
          {allowed.length > 0 && (
            <section
              aria-labelledby="model-heading"
              className="rounded-xl border border-white/[0.06] bg-card/40 p-4"
            >
              <div className="flex items-baseline justify-between mb-3">
                <h3
                  id="model-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Model
                </h3>
                <span className="text-[10px] text-muted-foreground/60">
                  {allowed.length} available
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Choose which AI model generates your slides.
              </p>

              <RadioGroupPrimitive.Root
                value={selectedId}
                onValueChange={onPick}
                aria-label="Select AI model"
                className="flex flex-col gap-1.5"
              >
                {allowed.map((m) => {
                  const isSelected = selectedId === m.modelId
                  const isDefault = m.modelId === defaultId
                  return (
                    <RadioGroupPrimitive.Item
                      key={m.modelId}
                      value={m.modelId}
                      className={[
                        "group relative w-full text-left rounded-lg border px-3 py-2.5 outline-none",
                        "motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-150",
                        "focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        isSelected
                          ? "border-brand-teal/70 bg-brand-teal-soft shadow-[inset_2px_0_0_0] shadow-brand-teal"
                          : "border-white/[0.08] bg-transparent hover:border-white/[0.18] hover:bg-white/[0.03]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground leading-tight">
                              {m.displayName}
                            </span>
                            {isDefault && (
                              <span
                                className="inline-flex items-center gap-0.5 rounded-full bg-brand-teal/15 px-1.5 py-px text-[10px] font-semibold text-brand-teal"
                                aria-label="Recommended"
                              >
                                <Sparkles className="h-2.5 w-2.5" />
                                Recommended
                              </span>
                            )}
                          </div>
                          {m.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                              {m.description}
                            </p>
                          )}
                        </div>
                        <span
                          aria-hidden="true"
                          className={[
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            "motion-safe:transition-colors motion-safe:duration-150",
                            isSelected
                              ? "border-brand-teal bg-brand-teal"
                              : "border-white/20 group-hover:border-white/35",
                          ].join(" ")}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3.5} />}
                        </span>
                      </div>
                    </RadioGroupPrimitive.Item>
                  )
                })}
              </RadioGroupPrimitive.Root>

              {/* Composer override: inline, no accordion */}
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <label htmlFor="composer-model" className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">Composer model</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Override the model used for slide composition.
                    </div>
                  </div>
                  <select
                    id="composer-model"
                    value={composerModelId ?? ""}
                    onChange={(e) => setComposerModelId(e.target.value || undefined)}
                    className="shrink-0 rounded-md border border-white/[0.1] bg-background px-2.5 py-1.5 text-xs text-foreground outline-none hover:border-white/[0.2] focus:border-brand-teal/50 motion-safe:transition-colors cursor-pointer"
                  >
                    <option value="">Same as main</option>
                    {allowed.map((m) => (
                      <option key={m.modelId} value={m.modelId}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
