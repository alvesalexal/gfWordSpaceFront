'use client';

import Box from '@mui/material/Box';

interface HtmlContentProps {
  html: string;
}

export function HtmlContent({ html }: HtmlContentProps): React.JSX.Element {
  return (
    <Box
      sx={{
        '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
        '& p': { mb: 1 },
        '& h1, & h2, & h3, & h4': { mt: 2, mb: 1 },
        '& ul, & ol': { pl: 3, mb: 1 },
        '& blockquote': { borderLeft: 3, borderColor: 'primary.main', pl: 2, fontStyle: 'italic', my: 1 },
        '& pre': { bgcolor: 'background.level1', p: 2, borderRadius: 1, overflow: 'auto' },
        '& code': { bgcolor: 'background.level1', px: 0.5, borderRadius: 0.5 },
        '& table': { width: '100%', borderCollapse: 'collapse', my: 1 },
        '& th, & td': { border: 1, borderColor: 'divider', p: 1 },
        '& a': { color: 'primary.main' },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
