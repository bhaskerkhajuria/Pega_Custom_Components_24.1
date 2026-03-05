import { useRef, useState, useCallback, useEffect, Children, type PropsWithChildren } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@pega/cosmos-react-core';
import StyledSearchLayoutWrapper, {
  StyledLayoutContainer,
  StyledResizeHandle,
  StyledCaretButton
} from './styles';

// ─── Types ────────────────────────────────────────────────────────────────────

type PegaExtensionsSearchLayoutProps = {
  searchPaneTitle?: string;
  resultsPaneTitle?: string;
  searchButtonLabel?: string;
  resetButtonLabel?: string;
  layoutDirection?: 'vertical' | 'horizontal';
  resultsPlaceholder?: string;
  getPConnect: any;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PegaExtensionsSearchLayout(
  props: PropsWithChildren<PegaExtensionsSearchLayoutProps>
) {
  const {
    searchPaneTitle = 'Search Criteria',
    resultsPaneTitle = 'Search Results',
    searchButtonLabel = 'Search',
    resetButtonLabel = 'Reset',
    layoutDirection = 'vertical',
    resultsPlaceholder = 'Enter search criteria and click Search.',
    getPConnect,
    children
  } = props;

  // Constellation passes each CONTENTPICKER slot as a child in config order:
  // children[0] = searchFieldPane, children[1] = resultsPane
  const childArray = Children.toArray(children) as ReactElement[];
  const searchFieldPaneChild = childArray[0] ?? null;
  const resultsPaneChild = childArray[1] ?? null;

  // ── Resize state (vertical mode) ──────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(30);
  const isDragging = useRef(false);

  // ── Collapse state (horizontal mode) ──────────────────────────────────
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  // ── Results visibility — hidden until Search is clicked ───────────────
  // Prevents results view from auto-refreshing on field change
  const [searchTriggered, setSearchTriggered] = useState(false);

  // ── Resize handlers ───────────────────────────────────────────────────

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (layoutDirection !== 'vertical') return;
      isDragging.current = true;
      e.preventDefault();
    },
    [layoutDirection]
  );

  useEffect(() => {
    if (layoutDirection !== 'vertical') return undefined;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const next = Math.round(
        Math.min(70, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100))
      );
      setSplitPercent(next);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [layoutDirection]);

  const onHandleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (layoutDirection !== 'vertical') return;
      if (e.key === 'ArrowLeft') {
        setSplitPercent(prev => Math.max(20, prev - 2));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setSplitPercent(prev => Math.min(70, prev + 2));
        e.preventDefault();
      }
    },
    [layoutDirection]
  );

  // ── Search ────────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    // Show results pane and trigger a CASE_UPDATE refresh so the results
    // view re-fetches with the current field values from the clipboard page
    setSearchTriggered(true);
    try {
      const context = getPConnect().getContextName();
      PCore.getRefreshManager().triggerRefreshForType('CASE_UPDATE', '', context);
    } catch {
      // no-op in Storybook
    }
  }, [getPConnect]);

  // ── Reset ─────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    try {
      const pConn = getPConnect();
      const context = pConn.getContextName();
      const pageRef = pConn.getPageReference();

      // Get all field metadata from the search pane's view and clear each value
      const rawMeta = pConn.getRawMetadata?.() as any;
      const searchFields: any[] = rawMeta?.config?.searchFieldPane ?? [];
      searchFields.forEach((field: any) => {
        if (field?.config?.value) {
          pConn.getActionsApi().updateFieldValue(field.config.value, '', { context, pageReference: pageRef });
        }
      });

      // Trigger refresh to update the UI with cleared values
      PCore.getRefreshManager().triggerRefreshForType('PROP_CHANGE', pageRef, context);
    } catch {
      // no-op in Storybook
    }

    // Also hide results until Search is clicked again
    setSearchTriggered(false);
  }, [getPConnect]);

  // ── Collapse buttons ──────────────────────────────────────────────────

  const searchCollapseAction = layoutDirection === 'horizontal' ? (
    <StyledCaretButton
      variant='simple'
      aria-expanded={!searchCollapsed}
      aria-controls='search-pane-content'
      aria-label={searchCollapsed ? `Expand ${searchPaneTitle}` : `Collapse ${searchPaneTitle}`}
      onClick={() => setSearchCollapsed(c => !c)}
    >
      {searchCollapsed ? '▼' : '▲'}
    </StyledCaretButton>
  ) : undefined;

  const resultsCollapseAction = layoutDirection === 'horizontal' ? (
    <StyledCaretButton
      variant='simple'
      aria-expanded={!resultsCollapsed}
      aria-controls='results-pane-content'
      aria-label={resultsCollapsed ? `Expand ${resultsPaneTitle}` : `Collapse ${resultsPaneTitle}`}
      onClick={() => setResultsCollapsed(c => !c)}
    >
      {resultsCollapsed ? '▼' : '▲'}
    </StyledCaretButton>
  ) : undefined;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <StyledSearchLayoutWrapper>
      <StyledLayoutContainer
        $direction={layoutDirection}
        ref={containerRef}
        aria-label={`${searchPaneTitle} / ${resultsPaneTitle} layout`}
      >
        {/* Search Field Pane */}
        <Card
          style={{
            width: layoutDirection === 'vertical' ? `${splitPercent}%` : '100%',
            minWidth: layoutDirection === 'vertical' ? '200px' : undefined,
            flexShrink: layoutDirection === 'vertical' ? 0 : undefined,
            overflow: searchCollapsed ? 'hidden' : undefined,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardHeader actions={searchCollapseAction}>
            <h2
              id='search-pane-heading'
              style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {searchPaneTitle}
            </h2>
          </CardHeader>

          {!searchCollapsed && (
            <CardContent
              id='search-pane-content'
              role='region'
              aria-labelledby='search-pane-heading'
              style={{ flex: '1 1 auto' }}
            >
              {searchFieldPaneChild}
            </CardContent>
          )}

          {!searchCollapsed && (
            <CardFooter justify='end'>
              <Button
                variant='secondary'
                onClick={handleReset}
                aria-label={resetButtonLabel}
              >
                {resetButtonLabel}
              </Button>
              <Button
                variant='primary'
                onClick={handleSearch}
                aria-label={searchButtonLabel}
              >
                {searchButtonLabel}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Resize handle — vertical only */}
        {layoutDirection === 'vertical' && (
          <StyledResizeHandle
            role='separator'
            aria-orientation='vertical'
            aria-label='Drag to resize panes. Use arrow keys for keyboard control.'
            aria-valuenow={splitPercent}
            aria-valuemin={20}
            aria-valuemax={70}
            tabIndex={0}
            onMouseDown={onMouseDown}
            onKeyDown={onHandleKeyDown}
          />
        )}

        {/* Results Pane — only rendered after Search is clicked */}
        <Card
          style={{
            flex: layoutDirection === 'vertical' ? '1 1 auto' : undefined,
            width: layoutDirection === 'vertical' ? `${100 - splitPercent}%` : '100%',
            minWidth: 0,
            overflow: resultsCollapsed ? 'hidden' : undefined,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardHeader actions={resultsCollapseAction}>
            <h2
              id='results-pane-heading'
              style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {resultsPaneTitle}
            </h2>
          </CardHeader>

          {!resultsCollapsed && searchTriggered && (
            <CardContent
              id='results-pane-content'
              role='region'
              aria-labelledby='results-pane-heading'
              aria-live='polite'
              aria-atomic='false'
            >
              {resultsPaneChild}
            </CardContent>
          )}

          {!resultsCollapsed && !searchTriggered && (
            <CardContent style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#888', fontSize: '0.875rem' }}>{resultsPlaceholder}</span>
            </CardContent>
          )}
        </Card>
      </StyledLayoutContainer>
    </StyledSearchLayoutWrapper>
  );
}
