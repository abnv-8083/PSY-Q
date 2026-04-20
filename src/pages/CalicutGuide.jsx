import { Box, Container, Typography, Button, Chip, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, GraduationCap, Users, ArrowLeft, Star, Clock, Award } from 'lucide-react';

const PORTAL_URL = 'https://phsyq.vercel.app/';

const features = [
  {
    icon: BookOpen,
    title: 'Comprehensive Study Material',
    desc: 'Year-wise curated notes covering the full University of Calicut psychology curriculum.',
  },
  {
    icon: GraduationCap,
    title: 'Exam-Ready Content',
    desc: 'Topic summaries, important questions, and model answers aligned with university patterns.',
  },
  {
    icon: Users,
    title: 'Expert Faculty',
    desc: 'Content designed and reviewed by experienced psychology educators and practitioners.',
  },
  {
    icon: Clock,
    title: 'Self-Paced Learning',
    desc: 'Study at your own pace — access materials anytime, from any device.',
  },
  {
    icon: Star,
    title: 'Regularly Updated',
    desc: 'Content stays current with the latest University of Calicut syllabus revisions.',
  },
  {
    icon: Award,
    title: 'Free Trial Available',
    desc: 'Try the platform before committing — no signup required to explore sample content.',
  },
];

const CalicutGuide = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fdf2f8' }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #C2185B 0%, #880e4f 60%, #1a1a2e 100%)',
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -100, left: -60,
          width: 280, height: 280, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="lg">
          {/* Back link */}
          <Box
            component={Link}
            to="/academic-support"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              mb: 4,
              '&:hover': { color: '#fff' },
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={16} />
            Academic Support
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3, flexWrap: 'wrap' }}>
            {/* University logo */}
            <Box sx={{
              width: 64, height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logos/calicut.png" alt="Calicut University" style={{ width: '90%', height: '90%', objectFit: 'fill' }} />
            </Box>

            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', mb: 0.5 }}>
                University of Calicut
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h3" sx={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}>
                  PSY-Q Calicut Students Guide
                </Typography>
                <Chip label="LIVE" sx={{
                  bgcolor: '#fff',
                  color: '#C2185B',
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  height: 22,
                  letterSpacing: 1.5,
                }} />
              </Box>
            </Box>
          </Box>

          <Typography sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.7,
            maxWidth: 620,
            mb: 5,
          }}>
            Your complete academic companion for the University of Calicut psychology programme.
            Year-wise notes, exam guides, and expert-curated content — all in one place.
          </Typography>

          {/* CTA buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component="a"
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<ExternalLink size={16} />}
              sx={{
                bgcolor: '#fff',
                color: '#C2185B',
                fontWeight: 900,
                fontSize: '0.95rem',
                px: 4, py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#ffe0eb',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
                },
                transition: 'all 0.25s',
              }}
            >
              Open Student Portal
            </Button>
            <Button
              component="a"
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: '0.9rem',
                px: 3, py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
                transition: 'all 0.2s',
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Site Preview ── */}
      <Box sx={{ bgcolor: '#1a1a2e', py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Browser chrome */}
            <Box sx={{
              borderRadius: '12px 12px 0 0',
              bgcolor: '#2a2a3e',
              px: 2, py: 1,
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
                <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
              ))}
              <Box sx={{
                ml: 2, flex: 1, maxWidth: 340,
                bgcolor: 'rgba(255,255,255,0.08)',
                borderRadius: '6px',
                px: 1.5, py: 0.4,
                display: 'flex', alignItems: 'center', gap: 0.8,
              }}>
                <ExternalLink size={11} color="rgba(255,255,255,0.5)" />
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  phsyq.vercel.app
                </Typography>
              </Box>
            </Box>

            {/* Screenshot */}
            <Box
              component="a"
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'block',
                cursor: 'pointer',
                position: 'relative',
                '&:hover .preview-overlay': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src="https://phsyq.vercel.app/og-image.png"
                alt="PSY-Q Calicut portal preview"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                sx={{
                  width: '100%',
                  height: { xs: 220, sm: 300, md: 380 },
                  objectFit: 'cover',
                  objectPosition: 'top',
                  display: 'block',
                  borderRadius: '0 0 12px 12px',
                }}
              />
              {/* Hover overlay */}
              <Box className="preview-overlay" sx={{
                position: 'absolute', inset: 0,
                borderRadius: '0 0 12px 12px',
                bgcolor: 'rgba(194,24,91,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.25s',
              }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: '#fff', color: '#C2185B',
                  fontWeight: 900, fontSize: '1rem',
                  borderRadius: 3, px: 3.5, py: 1.5,
                  letterSpacing: 0.5,
                }}>
                  <ExternalLink size={18} />
                  Open Portal
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Features Grid ── */}
      <Box sx={{ py: { xs: 7, md: 10 }, px: { xs: 2, md: 4 }, bgcolor: '#fdf2f8' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="WHAT'S INSIDE" sx={{ bgcolor: '#fce4ec', color: '#C2185B', fontWeight: 800, fontSize: '0.7rem', mb: 2, letterSpacing: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a2e', mb: 1.5, letterSpacing: -0.5 }}>
              Everything You Need to Excel
            </Typography>
            <Typography sx={{ color: '#6b7280', maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
              The PSY-Q Calicut portal is built specifically for University of Calicut psychology students.
            </Typography>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Box sx={{
                  p: 3.5,
                  borderRadius: 4,
                  bgcolor: '#fff',
                  border: '1px solid #f3e0e8',
                  boxShadow: '0 2px 16px rgba(194,24,91,0.06)',
                  height: '100%',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 32px rgba(194,24,91,0.12)',
                  },
                }}>
                  <Box sx={{
                    width: 48, height: 48,
                    borderRadius: 3,
                    bgcolor: '#fce4ec',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 2,
                    color: '#C2185B',
                  }}>
                    <Icon size={22} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.75, fontSize: '0.95rem' }}>
                    {title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.65 }}>
                    {desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA Banner ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #C2185B 0%, #880e4f 100%)',
        py: { xs: 7, md: 9 },
        px: { xs: 2, md: 4 },
      }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 2, letterSpacing: -0.5 }}>
            Ready to Start Learning?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, lineHeight: 1.7 }}>
            Join hundreds of Calicut University psychology students who use PSY-Q to study smarter.
          </Typography>
          <Button
            component="a"
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="large"
            endIcon={<ExternalLink size={18} />}
            sx={{
              bgcolor: '#fff',
              color: '#C2185B',
              fontWeight: 900,
              fontSize: '1rem',
              px: 5, py: 1.8,
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#ffe0eb',
                transform: 'translateY(-3px)',
                boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
              },
              transition: 'all 0.25s',
            }}
          >
            Visit PSY-Q Calicut Portal
          </Button>
        </Container>
      </Box>

    </Box>
  );
};

export default CalicutGuide;
