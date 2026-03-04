// ─── Mock factories for Storybook ─────────────────────────────────────────────

function buildBasePConnect(overrides: Record<string, unknown> = {}) {
  return () => ({
    getComponentName: () => '',
    getContextName: () => 'primary',
    getPageReference: () => '.SearchPage',
    getActionsApi: () => ({
      triggerFieldChange: () => {
        // no-op
      }
    }),
    getComponentsRegistry: () => ({
      getComponent: () => null
    }),
    createComponent: () => () => null,
    ...overrides
  });
}

export function mockVertical() {
  return {
    searchPaneTitle: 'Search Criteria',
    resultsPaneTitle: 'Search Results',
    searchButtonLabel: 'Search',
    resetButtonLabel: 'Reset',
    layoutDirection: 'vertical' as const,
    searchFieldPane: [],
    resultsPane: [],
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