// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * Local Open API — opens a deck file or directory with the OS default handler.
 * macOS: `open`, Linux: `xdg-open`, Windows: `start`
 */
import { execFile } from "child_process"
import path from "path"
import fs from "fs"
import { DECK_ROOT } from "@/lib/local/deck-paths"

/** Only allow safe characters in path segments to prevent traversal/injection. */
const SAFE_SEGMENT = /^[a-zA-Z0-9_\-][a-zA-Z0-9_\-.]*$/

/**
 * Resolve a safe path under root. Returns null if the segment is invalid.
 * Uses allowlist validation so user input never reaches path.resolve directly.
 */
function safePath(root: string, segment: string): string | null {
  if (!SAFE_SEGMENT.test(segment)) return null
  // Construct path from validated literal — no user-controlled data in resolve
  const resolved = path.join(root, segment)
  // Defence-in-depth: verify the result is still under root
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return null
  return resolved
}

export async function POST(req: Request) {
  const { deckId, file } = await req.json()

  const deckDir = deckId ? safePath(DECK_ROOT, deckId) : null
  if (!deckDir)
    return Response.json({ error: "invalid deckId" }, { status: 400 })
  if (!fs.existsSync(deckDir))
    return Response.json({ error: "deck not found" }, { status: 404 })

  let target = deckDir
  if (file) {
    const filePath = safePath(deckDir, file)
    if (!filePath)
      return Response.json({ error: "invalid file" }, { status: 400 })
    target = filePath
  }
  if (!fs.existsSync(target))
    return Response.json({ error: "file not found" }, { status: 404 })

  const cmd = process.platform === "win32" ? "start" : process.platform === "linux" ? "xdg-open" : "open"
  execFile(cmd, [target])

  return Response.json({ ok: true })
}
