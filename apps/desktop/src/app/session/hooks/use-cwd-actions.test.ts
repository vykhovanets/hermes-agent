// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureProjectForFolder } from '@/store/projects'
import { $currentCwd, setCurrentBranch, setCurrentCwd } from '@/store/session'

import { useCwdActions } from './use-cwd-actions'

vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: {
      desktop: {
        cwdChangeFailed: 'Failed to change folder',
        cwdStagedMessage: 'Folder staged',
        cwdStagedTitle: 'Folder staged'
      }
    }
  })
}))

vi.mock('@/store/notifications', () => ({
  notify: vi.fn(),
  notifyError: vi.fn()
}))

vi.mock('@/store/projects', () => ({
  ensureProjectForFolder: vi.fn()
}))

const ensureProjectForFolderMock = vi.mocked(ensureProjectForFolder)

describe('useCwdActions changeSessionCwd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setCurrentCwd('')
    setCurrentBranch('')
  })

  it('creates or enters a project before staging a folder for a new chat', async () => {
    ensureProjectForFolderMock.mockResolvedValue('/workspace/selected-folder')
    const requestGateway = vi.fn().mockResolvedValue({ branch: 'main', cwd: '/workspace/selected-folder' })
    const { result } = renderHook(() =>
      useCwdActions({
        activeSessionId: null,
        activeSessionIdRef: { current: null },
        requestGateway
      })
    )

    await act(async () => {
      await result.current.changeSessionCwd('/picked/folder')
    })

    expect(ensureProjectForFolderMock).toHaveBeenCalledWith('/picked/folder')
    expect(requestGateway).toHaveBeenCalledWith('config.get', {
      cwd: '/workspace/selected-folder',
      key: 'project'
    })
    expect($currentCwd.get()).toBe('/workspace/selected-folder')
  })
})
