// Pega Infinity 24.1 — Pega_Extensions_SearchLayout styles

import styled, { css } from 'styled-components';
import { Button } from '@pega/cosmos-react-core';

// ─── Wrapper ──────────────────────────────────────────────────────────────────

const StyledSearchLayoutWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
`;

export default StyledSearchLayoutWrapper;

// ─── Layout container ─────────────────────────────────────────────────────────

export const StyledLayoutContainer = styled.div<{
  $direction: 'vertical' | 'horizontal';
}>`
  display: flex;
  width: 100%;
  box-sizing: border-box;

  ${({ $direction }) =>
    $direction === 'vertical'
      ? css`
          flex-direction: row;
          align-items: stretch;
          gap: 0;
          min-height: 400px;
        `
      : css`
          flex-direction: column;
          gap: 1rem;
        `}

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

// ─── Resize handle (vertical mode only) ──────────────────────────────────────

export const StyledResizeHandle = styled.div`
  width: 7px;
  flex-shrink: 0;
  cursor: col-resize;
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  z-index: 1;

  /* Visible grip pill */
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 48px;
    border-radius: 4px;
    background: var(--app-border-color, #d0d0d0);
    transition:
      background 0.15s,
      height 0.15s;
  }

  /* Dots on the grip */
  &::after {
    content: '⋮';
    position: absolute;
    font-size: 1rem;
    line-height: 1;
    color: var(--app-text-subtle, #999);
    pointer-events: none;
    transition: color 0.15s;
  }

  &:hover::before,
  &:focus::before {
    background: var(--app-primary, #1f6cf5);
    height: 64px;
  }

  &:hover::after,
  &:focus::after {
    color: var(--app-primary, #1f6cf5);
  }

  /* Wider invisible hit area */
  &:focus-visible {
    outline: 2px solid var(--app-focus-ring, #1f6cf5);
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

// ─── Search fields grid ───────────────────────────────────────────────────────

export const StyledSearchFieldsGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 0.75rem;
  align-items: start;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: repeat(${({ $columns }) => Math.min($columns, 2)}, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// ─── Caret collapse/expand button ─────────────────────────────────────────────

export const StyledCaretButton = styled(Button)`
  && {
    min-height: unset;
    height: 1.5rem;
    width: 1.5rem;
    padding: 0;
    border-radius: 4px;
    background: transparent;
    border: none;
    font-size: 0.7rem;
    line-height: 1;
    color: var(--app-text-subtle, #555);
  }

  &:hover {
    background: var(--app-surface-hover, #e8e8e8);
    color: var(--app-text-strong, #1a1a1a);
  }

  &:focus-visible {
    outline: 2px solid var(--app-focus-ring, #1f6cf5);
    outline-offset: 2px;
  }
`;
