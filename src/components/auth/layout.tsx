'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';

export interface LayoutProps {
  children: React.ReactNode;
}


const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 35px) scale(1.02); }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-40px, 25px) scale(0.97); }
  50% { transform: translate(25px, -35px) scale(1.04); }
  75% { transform: translate(-15px, -20px) scale(0.98); }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(35px, 30px) scale(1.03); }
  66% { transform: translate(-30px, -25px) scale(0.96); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1b2a 25%, #1a1a3e 50%, #0f2027 75%, #0a0f1a 100%)',
      }}
    >
      {/* Animated floating orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: { xs: 200, md: 350 },
          height: { xs: 200, md: 350 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21, 183, 159, 0.15) 0%, rgba(21, 183, 159, 0) 70%)',
          filter: 'blur(40px)',
          animation: `${float1} 20s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: { xs: 250, md: 400 },
          height: { xs: 250, md: 400 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 91, 255, 0.12) 0%, rgba(99, 91, 255, 0) 70%)',
          filter: 'blur(50px)',
          animation: `${float2} 25s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '30%',
          width: { xs: 180, md: 300 },
          height: { xs: 180, md: 300 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 91, 255, 0.1) 0%, rgba(21, 183, 159, 0.05) 50%, transparent 70%)',
          filter: 'blur(45px)',
          animation: `${float3} 18s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* LeaoGF SVG background */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 340, sm: 440, md: 560 },
          height: { xs: 340, sm: 440, md: 560 },
          opacity: 0.07,
          pointerEvents: 'none',
          zIndex: 1,
          backgroundImage: 'url(/assets/LeaoGFBlack.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          filter: 'brightness(0) invert(1)',
        }}
      />

      {/* Main content - centered card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          pb: 6,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            animation: `${fadeInUp} 0.6s ease-out`,
          }}
        >
          {/* Glassmorphic card */}
          <Box
            sx={{
              background: 'rgba(10, 15, 26, 0.18)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '24px',
              p: { xs: 4, sm: 5 },
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {children}
          </Box>

          {/* Footer text */}
          <Typography
            align="center"
            sx={{
              mt: 4,
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
            }}
          >
            WordSpace &mdash; Estudos Biblicos e Espaco de Aprendizado
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
