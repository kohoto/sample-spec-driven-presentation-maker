// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { ModelPicker } from "@/components/ModelPicker"
import { usePreferences } from "@/hooks/usePreferences"
import { getAllowedModels, getDefaultModelId } from "@/lib/allowedModels"
import { toast } from "sonner"
import { useEffect, useMemo } from "react"

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const {
    sendWithEnter,
    setSendWithEnter,
    modelId,
    setModelId,
    composerModelId,
    setComposerModelId,
  } = usePreferences()
  const allowed = useMemo(() => getAllowedModels(), [])
  const defaultId = useMemo(() => getDefaultModelId(), [])

  // Silently drop stale selections (admin may have removed the model from config).
  useEffect(() => {
    if (modelId && allowed.length > 0 && !allowed.some((m) => m.modelId === modelId)) {
      setModelId(undefined)
    }
    if (composerModelId && allowed.length > 0 && !allowed.some((m) => m.modelId === composerModelId)) {
      setComposerModelId(undefined)
    }
  }, [modelId, composerModelId, allowed, setModelId, setComposerModelId])

  const onMainChange = (id: string | undefined) => {
    setModelId(id)
    const m = id ? allowed.find((a) => a.modelId === id) : undefined
    toast.success(m ? `Main agent: ${m.displayName}` : "Main agent: default")
  }

  const onSubChange = (id: string | undefined) => {
    setComposerModelId(id)
    if (id === undefined) {
      toast.success("Sub agent inherits main")
    } else {
      const m = allowed.find((a) => a.modelId === id)
      if (m) toast.success(`Sub agent: ${m.displayName}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[460px] overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-lg">Settings</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-5 pb-6">
          {/* ── Models (per-agent) ── */}
          {allowed.length > 0 && (
            <section
              aria-labelledby="model-heading"
              className="rounded-xl border border-white/[0.06] bg-card/40 p-4"
            >
              <div className="mb-3">
                <h3
                  id="model-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Models
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose which AI model each agent uses.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Main agent */}
                <div>
                  <label
                    htmlFor="main-agent-model"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Main agent
                  </label>
                  <ModelPicker
                    models={allowed}
                    value={modelId}
                    onChange={onMainChange}
                    defaultId={defaultId}
                    triggerId="main-agent-model"
                    ariaLabel="Select main agent model"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    Plans and orchestrates the conversation.
                  </p>
                </div>

                {/* Sub agent */}
                <div>
                  <label
                    htmlFor="sub-agent-model"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Sub agent
                  </label>
                  <ModelPicker
                    models={allowed}
                    value={composerModelId}
                    onChange={onSubChange}
                    defaultId={defaultId}
                    inheritLabel="Same as main agent"
                    triggerId="sub-agent-model"
                    ariaLabel="Select sub agent model"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    Generates individual slides. Inherits the main model by default.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ── Chat ── */}
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
                <div className="mt-0.5 text-xs text-muted-foreground">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
