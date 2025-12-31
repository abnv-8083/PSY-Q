import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PublicIcon from '@mui/icons-material/Public';

const About = () => {
  return (
    <Box component="main" sx={{ bgcolor: '#f5f5f5', py: { xs: 6, sm: 8, lg: 10 } }}>
      <Container maxWidth="lg">
        {/* Welcome to PSYQ Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="Evidence-Based Care" 
                icon={<Box component="span" sx={{ fontSize: '11px' }}>🛡️</Box>}
                sx={{ 
                  bgcolor: '#fae0edff', 
                  color: '#ca0056',
                  mb: 3,
                  fontWeight: 600,
                  p: 1.5,
                  height: 'auto',
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
              <Typography variant="h2" sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                lineHeight: 1
              }}>
                Welcome to <Box component="span" sx={{ color: '#ca0056' }}>PSYQ</Box>
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#00388C', 
                fontWeight: 500,
                mb: 2
              }}>
                No mind left behind
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                fontSize: '14px'
              }}>
                PSYQ Learning is an initiative introduced by a group of psychologists that
                strives to make professional psychological support accessible and
                approachable. Our work spans therapy, trauma care, rehabilitation,
                education, and workplace wellbeing. We aim to create a supportive
                environment where mental health is prioritized and stigma is reduced.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: { xs: 360, md: 520 },
                  bgcolor: 'white',
                  borderRadius: { xs: 4, md: 6 },
                  p: { xs: 3, md: 6 },
                  boxShadow: 1,
                  overflow: 'hidden'
                }}>
                  <Box component="img"
                    src="/images/story-graphic.png"
                    alt="Healing Pathways"
                    sx={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                  />
                </Box>

                {/* Focus card - overlaps the image on md+ */}
                <Paper elevation={3} sx={{
                  position: { xs: 'static', md: 'absolute' },
                  bottom: { md: -20 },
                  left: { md: 'calc(50% + 20px)' },
                  transform: { md: 'translateX(-50%)' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'white',
                  width: { xs: '100%', md: 260 },
                  maxWidth: '90%'
                }}>
                  <Box sx={{
                    bgcolor: '#fae0edff',
                    borderRadius: 2,
                    p: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 44,
                    minHeight: 44
                  }}>
                    <Box component="span" sx={{ fontSize: '1.25rem' }}>🎯</Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      FOCUS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Holistic Wellbeing
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Mission and Vision Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* Our Mission */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 4,
              p: 4,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: '#ca0056'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  bgcolor: '#fae0edff',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MenuBookIcon sx={{ color: '#ca0056', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Our Mission
                </Typography>
              </Box>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                fontSize: '0.95rem'
              }}>
                To provide compassionate, evidence-based, and personalized
                mental health care through a holistic and multidisciplinary
                approach. We address a wide spectrum of needs through
                psychotherapy, counseling, rehabilitation, and career guidance.
                By advancing innovative research and fostering continuous
                learning, we empower individuals to achieve personal growth and
                lead meaningful lives.
              </Typography>
            </Paper>
          </Grid>

          {/* Our Vision */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ 
              bgcolor: '#00368c',
              borderRadius: 4,
              p: 4,
              height: '100%',
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PublicIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Our Vision
                </Typography>
              </Box>
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.95)', 
                lineHeight: 1.8,
                fontSize: '0.95rem'
              }}>
                Fostering mental health, well-being, and inclusivity through
                psychological care, education, research, and holistic rehabilitation
                —delivered with evidence-based, compassionate services that
                empower individuals across all walks of life to recover, grow, and
                flourish.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Features Grid */}
        <Grid container spacing={2} columns={{ xs: 1, md: 3, lg: 3 }} sx={{ mb: 8 }}>
          <Grid item xs={1} md={1}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 64,
                height: 64,
                bgcolor: '#f0f9ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '2rem' }}>💡</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                Expert Guidance
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                Our experienced faculty provides personalized guidance tailored to each student's needs.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={1} md={1}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 64,
                height: 64,
                bgcolor: '#f0fdf4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '2rem' }}>🧠</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                Psychological Support
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                We provide counseling services to help students manage stress and build confidence.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={1} md={1}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 64,
                height: 64,
                bgcolor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '2rem' }}>📚</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                Interactive Learning
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                Our dynamic modules and webinars make learning engaging and effective.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* The Story Section */}
        <Paper elevation={0} sx={{ 
          bgcolor: 'white',
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          mb: 8
        }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}>
                <Box component="span" sx={{ color: '#1e40af' }}>The Story of</Box>{' '}
                <Box component="span" sx={{ color: '#be185d' }}>PSYQ Learning</Box>
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                mb: 3,
                fontSize: '1rem'
              }}>
                PSYQ Learning started as a student-led initiative in Kerala, founded by a group
                of psychology professionals who are passionate about mental health and
                education. What began as a digital classroom soon grew into a platform
                connecting learners, counsellors, and educators.
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                fontSize: '1rem'
              }}>
                The goal was simple — to make psychology relevant, reachable, and rooted in
                real experiences. Over time, PSYQ developed a range of programs focusing on
                skill-building, awareness, and practical application. Today, it stands as a
                growing community dedicated to bringing professionalism and purpose into
                psychological education.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: '100%',
                  maxWidth: 320,
                  aspectRatio: '1',
                  borderRadius: 6,
                  overflow: 'hidden'
                }}>
                  <Box 
                    component="img"
                    src="/images/story-graphic.png" 
                    alt="PSYQ Learning Story"
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Paper elevation={0} sx={{ 
          bgcolor: 'white',
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 2,
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}>
            Ready to Start Your Journey?
          </Typography>
          <Typography sx={{ 
            fontSize: '1.1rem',
            color: '#64748b',
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Join thousands of students who have achieved their goals with Psy-Q's comprehensive support system.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <Box
                component="button"
                sx={{
                  bgcolor: '#ca0056',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#059669'
                  }
                }}
              >
                Contact Us
              </Box>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;
