import { reactive, readonly } from 'vue'

export interface AuthUser {
  username: string
  displayName: string
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
}

const STORAGE_KEY = 'acct_auth_user'

const state = reactive<AuthState>({
  user: loadFromStorage(),
})

function loadFromStorage(): AuthUser | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function setUser(user: AuthUser) {
  state.user = user
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function clearUser() {
  state.user = null
  sessionStorage.removeItem(STORAGE_KEY)
}

function hasPermission(permission: string): boolean {
  return state.user?.permissions.includes(permission) ?? false
}

export const authStore = {
  state: readonly(state),
  setUser,
  clearUser,
  hasPermission,
}
