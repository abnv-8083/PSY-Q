import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { ExternalLink, BookOpen, GraduationCap, Users } from 'lucide-react';

const CALICUT_LINK = 'https://phsyq.vercel.app/';

const Academic = () => {
  const ignou = {
    title: 'PSY-Q IGNOU STUDENTS GUIDE',
    description: 'Access comprehensive psychology courses, \nexpertly curated for each of your studies.',
    link: '/soon',
    icon: '/logos/ignou.png'
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#C2185B',
          py: { xs: '40px', sm: '80px', md: '100px' },
          px: { xs: 2, sm: 3, md: '80px' },
          minHeight: { xs: '50vh', md: '60vh' },
          display: 'flex',
          pt: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            ACADEMIC
          </Typography>
          <Typography
            sx={{
              color: 'white',
              fontSize: '14px',
              maxWidth: '900px',
              lineHeight: 1.6
            }}
          >
            PSY-Q Learning is designed to support learners with focused, flexible, and expertly guided sessions.
          </Typography>

          {/* Cards */}
          <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>

            {/* ── IGNOU Card (unchanged) ── */}
            <Grid item xs={12} md={6}>
              <Card
                component={Link}
                to={ignou.link}
                sx={{
                  bgcolor: '#F2B8C1',
                  borderRadius: 0,
                  padding: '40px',
                  height: '100%',
                  display: 'flex',
                  textDecoration: 'none',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, sm: 4 },
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 3,
                    width: '100%',
                    '&:last-child': { pb: { xs: 3, sm: 4 } }
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      minWidth: { xs: 50, sm: 60 },
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <img src={ignou.icon} alt={ignou.title} style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: '#000',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 700,
                        mb: 1.5,
                        lineHeight: 1.3,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {ignou.title}
                    </Typography>
                    <Typography sx={{ color: '#000', fontSize: '14px', lineHeight: 1.6, fontWeight: 400, whiteSpace: 'pre-line' }}>
                      {ignou.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ── CALICUT Card (external link with preview) ── */}
            <Grid item xs={12} md={6}>
              <Box
                component="a"
                href={CALICUT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'block',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
                  },
                  '&:hover .calicut-btn': {
                    bgcolor: '#9a0042',
                  }
                }}
              >
                {/* ── Site Preview Banner ── */}
                <Box sx={{ position: 'relative', width: '100%', height: 170, overflow: 'hidden', bgcolor: '#dce0f0' }}>

                  {/* Actual site screenshot — gracefully falls back */}
                  <Box
                    component="img"
                    src="https://phsyq.vercel.app/og-image.png"
                    alt="PSY-Q Calicut portal preview"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      document.getElementById('calicut-fallback').style.display = 'flex';
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block',
                    }}
                  />

                  {/* Gradient fallback (shown only if image 404s) */}
                  <Box
                    id="calicut-fallback"
                    sx={{
                      display: 'none',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #C2185B 0%, #880e4f 55%, #1a243a 100%)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <GraduationCap size={50} color="rgba(255,255,255,0.92)" />
                    <Typography sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 900, fontSize: '0.95rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      PSY-Q Calicut Guide
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem' }}>
                      phsyq.vercel.app
                    </Typography>
                  </Box>

                  {/* Browser chrome bar */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 26,
                    bgcolor: 'rgba(20,20,20,0.85)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    gap: 0.6,
                  }}>
                    {/* Traffic lights */}
                    {['#ff5f56', '#ffbd2e', '#27c93f'].map((col) => (
                      <Box key={col} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col, flexShrink: 0 }} />
                    ))}
                    {/* URL bar */}
                    <Box sx={{
                      ml: 1.5, flex: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      px: 1, py: 0.2,
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      maxWidth: 260,
                    }}>
                      <ExternalLink size={9} color="rgba(255,255,255,0.55)" />
                      <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: 0.3 }}>
                        phsyq.vercel.app
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* ── Card Content ── */}
                <Box sx={{
                  bgcolor: '#F2B8C1',
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}>
                  {/* Title row */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{
                      width: 52, height: 52, minWidth: 52,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img src="/logos/calicut.png" alt="Calicut University" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{
                          color: '#000',
                          fontSize: { xs: '1rem', sm: '1.05rem' },
                          fontWeight: 800,
                          lineHeight: 1.2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                        }}>
                          PSY-Q CALICUT STUDENTS GUIDE
                        </Typography>
                        <Chip
                          label="LIVE ✦"
                          size="small"
                          sx={{
                            bgcolor: '#C2185B',
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: '0.58rem',
                            height: 18,
                            letterSpacing: 0.8,
                            borderRadius: '4px',
                          }}
                        />
                      </Box>
                      <Typography sx={{ color: '#333', fontSize: '13px', lineHeight: 1.5 }}>
                        Access comprehensive psychology courses, expertly curated for each year of your studies at the University of Calicut.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Feature pills */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { icon: BookOpen, text: 'Course Notes' },
                      { icon: GraduationCap, text: 'Year-wise Content' },
                      { icon: Users, text: 'Expert Faculty' },
                    ].map(({ icon: Icon, text }) => (
                      <Box key={text} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        bgcolor: 'rgba(255,255,255,0.55)',
                        borderRadius: '6px', px: 1.5, py: 0.5,
                      }}>
                        <Icon size={11} color="#C2185B" />
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#4a0020' }}>{text}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* CTA */}
                  <Box
                    className="calicut-btn"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: '#C2185B',
                      color: '#fff',
                      borderRadius: '6px',
                      px: 2.5, py: 0.9,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      letterSpacing: 0.6,
                      transition: 'background-color 0.2s',
                      alignSelf: 'flex-start',
                      textTransform: 'uppercase',
                      mt: 0.5,
                    }}
                  >
                    Visit Portal
                    <ExternalLink size={13} />
                  </Box>
                </Box>
              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Academic;