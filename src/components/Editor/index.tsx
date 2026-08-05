import React, { useMemo, useRef, useState } from 'react';
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

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Comece a digitar...',
      height: '50vh',
      language: 'pt_br',
      theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
      width: '100%',
      hidePoweredByJodit: true,
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
      },
    }),
    []
  );

  return (
    <JoditEditor
      ref={editor}
      value={content}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => handeChangeContent(newContent)}
      onChange={(newContent) => handeChangeContent(newContent)}
    />
  );
}
