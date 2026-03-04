import { useRef, useState, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
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
  searchFieldPane?: any[];
  resultsPane?: any[];
  getPConnect: any;
};

// ─── Authoring guard ──────────────────────────────────────────────────────────

function isAuthoringMode(getPConnect: any): boolean {
  try {
    return getPConnect().getComponentName?.() === 'AUTHORING';
  } catch {
    return false;
  }
}

// ─── Slot renderer ────────────────────────────────────────────────────────────

function renderSlot(
  slot: any[],
  getPConnect: any
): (JSX.Element | null)[] | null {
  if (!slot?.length) return null;
  return slot.map((child: any, idx: number) => {
    const C = getPConnect()
      .getComponentsRegistry()
      .getComponent(child.type);
    if (!C) return null;
    const childPConn = getPConnect().createComponent(child, idx, slot.length);
    return <C key={child.id ?? idx} getPConnect={childPConn} />;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PegaExtensionsSearchLayout(
  props: PegaExtensionsSearchLayoutProps
) {
  const {
    searchPaneTitle = 'Search Criteria',
    resultsPaneTitle = 'Search Results',
    searchButtonLabel = 'Search',
    resetButtonLabel = 'Reset',
    layoutDirection = 'vertical',
    searchFieldPane = [],
    resultsPane = [],
    getPConnect
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(30);
  const isDragging = useRef(false);

  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);

  const [searchKey, setSearchKey] = useState(0);
  const [resultsKey, setResultsKey] = useState(0);

  const authoring = isAuthoringMode(getPConnect);

  // ── Resize ────────────────────────────────────────────────────────────

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

  // ── Actions ───────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    setResultsKey(k => k + 1);
    try {
      getPConnect()
        .getActionsApi()
        ?.triggerFieldChange?.('searchTriggered', true);
    } catch {
      // no-op in Storybook / authoring
    }
  }, [getPConnect]);

  const handleReset = useCallback(() => {
    setSearchKey(k => k + 1);
    setResultsKey(k => k + 1);
  }, []);

  // ── Shared: collapse action buttons for CardHeader ────────────────────

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

  // ── Authoring placeholder ─────────────────────────────────────────────

  if (authoring) {
    return (
      <StyledSearchLayoutWrapper>
        <StyledLayoutContainer $direction={layoutDirection} ref={containerRef}>
          <Card
            style={{
              width: layoutDirection === 'vertical' ? `${splitPercent}%` : '100%',
              minWidth: layoutDirection === 'vertical' ? '200px' : undefined,
              flexShrink: 0
            }}
          >
            <CardHeader>{searchPaneTitle}</CardHeader>
            <CardContent>
              <span style={{ color: '#888', fontSize: '0.875rem' }}>
                Drop fields, views, or widgets here
              </span>
            </CardContent>
            <CardFooter justify='end'>
              <Button variant='secondary'>{resetButtonLabel}</Button>
              <Button variant='primary'>{searchButtonLabel}</Button>
            </CardFooter>
          </Card>

          {layoutDirection === 'vertical' && (
            <StyledResizeHandle
              role='separator'
              aria-orientation='vertical'
              aria-label='Drag to resize panes'
              aria-valuenow={splitPercent}
              aria-valuemin={20}
              aria-valuemax={70}
              tabIndex={0}
              onKeyDown={onHandleKeyDown}
            />
          )}

          <Card
            style={{
              flex: layoutDirection === 'vertical' ? '1 1 auto' : undefined,
              width: layoutDirection === 'vertical'
                ? `${100 - splitPercent}%`
                : '100%',
              minWidth: 0
            }}
          >
            <CardHeader>{resultsPaneTitle}</CardHeader>
            <CardContent>
              <span style={{ color: '#888', fontSize: '0.875rem' }}>
                Drop a view here
              </span>
            </CardContent>
          </Card>
        </StyledLayoutContainer>
      </StyledSearchLayoutWrapper>
    );
  }

  // ── Runtime render ────────────────────────────────────────────────────

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
            boxSizing: 'border-box'
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
              key={searchKey}
              id='search-pane-content'
              role='region'
              aria-labelledby='search-pane-heading'
              style={{ flex: '1 1 auto' }}
            >
              {renderSlot(searchFieldPane, getPConnect)}
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

        {/* Results Pane */}
        <Card
style={{
            flex: layoutDirection === 'vertical' ? '1 1 auto' : undefined,
            width: layoutDirection === 'vertical'
              ? `${100 - splitPercent}%`
              : '100%',
            minWidth: 0,
            overflow: resultsCollapsed ? 'hidden' : undefined,
            boxSizing: 'border-box'
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

          {!resultsCollapsed && (
            <CardContent
              key={resultsKey}
              id='results-pane-content'
              role='region'
              aria-labelledby='results-pane-heading'
              aria-live='polite'
              aria-atomic='false'
            >
              {renderSlot(resultsPane, getPConnect)}
            </CardContent>
          )}
        </Card>
      </StyledLayoutContainer>
    </StyledSearchLayoutWrapper>
  );
}
