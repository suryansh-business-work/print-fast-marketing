import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface AuthBrandingProps {
  subtitle?: string;
}

const ChartDecoration = () => (
  <Box
    component="svg"
    viewBox="0 0 500 300"
    sx={{
      position: 'absolute',
      top: '10%',
      left: '5%',
      width: '90%',
      height: '50%',
      opacity: 0.3,
    }}
  >
    <defs>
      <linearGradient id="chartGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#29b6f6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#03a9f4" stopOpacity="0.9" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Grid lines */}
    {[60, 120, 180, 240].map((y) => (
      <line
        key={y}
        x1="30"
        y1={y}
        x2="470"
        y2={y}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
    ))}
    {/* Chart line */}
    <polyline
      points="30,240 100,220 170,200 220,180 270,140 320,120 370,80 420,50 470,20"
      fill="none"
      stroke="url(#chartGlow)"
      strokeWidth="3"
      filter="url(#glow)"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Arrow tip */}
    <polygon points="470,20 455,35 465,28" fill="#4fc3f7" opacity="0.8" />
    {/* Bar chart elements */}
    {[
      { x: 80, h: 40 },
      { x: 140, h: 65 },
      { x: 200, h: 55 },
      { x: 260, h: 80 },
      { x: 320, h: 100 },
      { x: 380, h: 130 },
    ].map((bar) => (
      <rect
        key={bar.x}
        x={bar.x}
        y={240 - bar.h}
        width="30"
        height={bar.h}
        fill="rgba(79, 195, 247, 0.15)"
        rx="3"
      />
    ))}
  </Box>
);

const AuthBranding = ({ subtitle }: AuthBrandingProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 30%, #133a5c 60%, #1a5276 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { md: 6, lg: 8 },
        py: 6,
        position: 'relative',
      }}
    >
      <ChartDecoration />

      {/* Branding content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: '#4fc3f7' }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
            ROAS PRO
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 2,
            fontSize: { md: '2rem', lg: '2.5rem' },
          }}
        >
          Maximize Your Returns.
          <br />
          Intelligent Ad Performance
          <br />
          Tracking.
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>
          {subtitle || 'Log in to access your dashboard.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthBranding;
