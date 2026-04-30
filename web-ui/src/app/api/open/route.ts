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

export async function POST(req: Request) {
  const { deckId, file } = await req.json()
  if (!deckId || !SAFE_SEGMENT.test(deckId))
    return Response.json({ error: "invalid deckId" }, { status: 400 })

  const deckDir = path.resolve(DECK_ROOT, deckId)
  if (!deckDir.startsWith(path.resolve(DECK_ROOT)))
    return Response.json({ error: "invalid path" }, { status: 400 })
  if (!fs.existsSync(deckDir))
    return Response.json({ error: "deck not found" }, { status: 404 })

  let target = deckDir
  if (file) {
    if (!SAFE_SEGMENT.test(file))
      return Response.json({ error: "invalid file" }, { status: 400 })
    target = path.resolve(deckDir, file)
    if (!target.startsWith(deckDir))
      return Response.json({ error: "invalid path" }, { status: 400 })
  }
  if (!fs.existsSync(target))
    return Response.json({ error: "file not found" }, { status: 404 })

  const cmd = process.platform === "win32" ? "start" : process.platform === "linux" ? "xdg-open" : "open"
  execFile(cmd, [target])

  return Response.json({ ok: true })
}
