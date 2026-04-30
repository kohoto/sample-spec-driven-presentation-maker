// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
"use client"

import { useAuth as useOidcAuth } from "react-oidc-context"
import { useEffect, useState } from "react"
import { WebStorageStateStore } from "oidc-client-ts"
import { createCognitoAuthConfig } from "@/lib/auth"

const IS_LOCAL = process.env.NEXT_PUBLIC_MODE === "local"

interface CognitoAuthConfig {
  authority: string
  client_id: string | undefined
  redirect_uri: string | undefined
  post_logout_redirect_uri: string | undefined
  response_type: string
  scope: string
  automaticSilentRenew: boolean
  userStore?: WebStorageStateStore
}

const LOCAL_AUTH = {
  isAuthenticated: true,
  user: { id_token: "local", access_token: "local", profile: { sub: "local-user" } },
  signIn: () => {},
  signOut: () => {},
  isLoading: false,
  error: null,
  token: "local",
}

export function useAuth() {
  // useOidcAuth() is called unconditionally to satisfy React's rules of hooks.
  // In local mode, OidcAuthProvider is absent so we suppress the console.warn
  // and fall back to LOCAL_AUTH below.
  const origWarn = IS_LOCAL ? console.warn : null
  if (IS_LOCAL) console.warn = () => {}
  // eslint-disable-next-line react-hooks/rules-of-hooks -- called unconditionally; IS_LOCAL is a build-time constant
  const oidcAuth = useOidcAuth()
  if (origWarn) console.warn = origWarn

  const [authConfig, setAuthConfig] = useState<CognitoAuthConfig | null>(null)

  useEffect(() => {
    if (IS_LOCAL) return
    createCognitoAuthConfig()
      .then(setAuthConfig)
      .catch(e => console.error("Failed to load auth configuration for signOut:", e))
  }, [])

  // Local mode: always return mock auth
  if (IS_LOCAL || !oidcAuth) {
    return LOCAL_AUTH
  }

  return {
    isAuthenticated: oidcAuth.isAuthenticated,
    user: oidcAuth.user,
    signIn: oidcAuth.signinRedirect,
    signOut: () => {
      const clientId = authConfig?.client_id || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ""
      const logoutUri =
        authConfig?.redirect_uri ||
        process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ||
        "http://localhost:3000"

      oidcAuth!.signoutRedirect({
        extraQueryParams: {
          client_id: clientId,
          logout_uri: logoutUri,
        },
      })
    },
    isLoading: oidcAuth.isLoading,
    error: oidcAuth.error,
    token: oidcAuth.user?.id_token,
  }
}
