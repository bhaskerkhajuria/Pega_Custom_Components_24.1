// Pega Infinity 24.1 — Storybook mock factories

// ─── Mock factories for Storybook ─────────────────────────────────────────────

function buildBasePConnect(overrides: Record<string, unknown> = {}) {
  // Cast to any — the mock only implements the subset of C11nEnv methods
  // that this component actually calls. Full C11nEnv has 121+ methods
  // which are unnecessary to mock for Storybook stories.
  return (() => ({
    getComponentName: () => '',
    getContextName: () => 'primary',
    getPageReference: () => '.SearchPage',
    getActionsApi: () => ({
      triggerFieldChange: () => {
        /* no-op */
      },
      updateFieldValue: () => {
        /* no-op */
      }
    }),
    getChildren: () => [],
    getStateProps: () => ({}),
    getConfigProps: () => ({}),
    getRawMetadata: () => ({}),
    getComponentsRegistry: () => ({
      getComponent: () => null
    }),
    createComponent: () => () => null,
    ...overrides
  })) as any;
}

export function mockVertical() {
  return {
    searchPaneTitle: 'Search Criteria',
    resultsPaneTitle: 'Search Results',
    searchButtonLabel: 'Search',
    resetButtonLabel: 'Reset',
    layoutDirection: 'vertical' as const,
    searchColumns: '3' as const,
    getPConnect: buildBasePConnect()
  };
}

export function mockHorizontal() {
  return {
    ...mockVertical(),
    layoutDirection: 'horizontal' as const,
    searchPaneTitle: 'Filters',
    resultsPaneTitle: 'Results'
  };
}

export function mockAuthoring() {
  return {
    ...mockVertical(),
    getPConnect: buildBasePConnect({
      getComponentName: () => 'AUTHORING'
    })
  };
}

export function mockCustomLabels() {
  return {
    ...mockVertical(),
    searchButtonLabel: 'Find',
    resetButtonLabel: 'Clear All',
    searchPaneTitle: 'Filter Criteria',
    resultsPaneTitle: 'Matching Records'
  };
}
