import React, { useMemo, useRef } from 'react';
import JoditEditor from 'jodit-react';
import { useTheme } from '@mui/material';

export default function Editor({
  content,
  handeChangeContent,
}: {
  content: string;
  handeChangeContent: (val: string) => void;
}) {
  const editor = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Comece a digitar...',
      height: '50vh',
      language: 'pt_br',
      theme: isDark ? 'dark' : 'default',
      width: '100%',
      hidePoweredByJodit: true,
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
      },
      style: {
        background: isDark
          ? 'var(--mui-palette-background-paper)'
          : 'var(--mui-palette-background-paper)',
        color: isDark
          ? 'var(--mui-palette-text-primary)'
          : 'var(--mui-palette-text-primary)',
        fontFamily: 'var(--typography-fontFamily)',
        fontSize: 'var(--typography-body1-size)',
      },
    }),
    [isDark]
  );

  const cssOverrides = `
    .jodit-container {
      background: var(--mui-palette-background-paper) !important;
      border-color: var(--mui-palette-divider) !important;
      border-radius: 8px !important;
    }
    .jodit-toolbar {
      background: var(--mui-palette-background-level1) !important;
      border-bottom-color: var(--mui-palette-divider) !important;
    }
    .jodit-toolbar__box {
      background: var(--mui-palette-background-level1) !important;
    }
    .jodit-toolbar-button {
      color: var(--mui-palette-text-secondary) !important;
    }
    .jodit-toolbar-button:hover {
      background: var(--mui-palette-action-hover) !important;
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-toolbar-button.active,
    .jodit-toolbar-button:active {
      background: var(--mui-palette-action-selected) !important;
      color: var(--mui-palette-primary-main) !important;
    }
    .jodit-workplace {
      background: var(--mui-palette-background-paper) !important;
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-editor__content {
      background: var(--mui-palette-background-paper) !important;
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-editor__content:focus {
      outline: none !important;
    }
    .jodit-placeholder {
      color: var(--mui-palette-text-disabled) !important;
    }
    .jodit-status-bar {
      background: var(--mui-palette-background-level1) !important;
      border-top-color: var(--mui-palette-divider) !important;
      color: var(--mui-palette-text-secondary) !important;
    }
    .jodit-popup {
      background: var(--mui-palette-background-paper) !important;
      border-color: var(--mui-palette-divider) !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
    }
    .jodit-popup__content {
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-color-picker__value {
      border-color: var(--mui-palette-divider) !important;
    }
    .jodit-input {
      background: var(--mui-palette-background-default) !important;
      border-color: var(--mui-palette-divider) !important;
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-button {
      background: var(--mui-palette-background-level1) !important;
      border-color: var(--mui-palette-divider) !important;
      color: var(--mui-palette-text-primary) !important;
    }
    .jodit-button:hover {
      background: var(--mui-palette-action-hover) !important;
    }
    .jodit-select {
      background: var(--mui-palette-background-default) !important;
      border-color: var(--mui-palette-divider) !important;
      color: var(--mui-palette-text-primary) !important;
    }
  `;

  return (
    <>
      <style>{cssOverrides}</style>
      <JoditEditor
        key={isDark ? 'dark' : 'light'}
        ref={editor}
        value={content}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => handeChangeContent(newContent)}
        onChange={(newContent) => handeChangeContent(newContent)}
      />
    </>
  );
}
