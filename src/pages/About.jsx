import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PublicIcon from '@mui/icons-material/Public';

const About = () => {
  return (
    <Box component="main" sx={{ bgcolor: '#f5f5f5', py: { xs: 7, md: 10 } }}>
      <Container maxWidth="xl">
        {/* Welcome to PSYQ Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="Evidence-Based Care" 
                icon={<Box component="span" sx={{ fontSize: '11px' }}>🛡️</Box>}
                sx={{ 
                  bgcolor: '#fae0edff', 
                  color: '#ca0056',
                  mb: 3,
                  marginLeft: 5,
                  fontWeight: 600,
                  p: 1.5,
                  height: 'auto',
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
              <Typography variant="h2" sx={{ 
                fontWeight: 700, 
                mb: 3,
                ml: 5,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                lineHeight: 1
              }}>
                Welcome to <Box component="span" sx={{ color: '#ca0056' }}>PSYQ</Box>
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#00388C', 
                fontWeight: 500,
                mb: 2,
                ml: 5,
              }}>
                No mind left behind
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                fontSize: '14px',
                maxWidth: 640,
                ml: 5,
              }}>
                PSYQ Learning is an initiative introduced by a group of psychologists that
                strives to make professional psychological support accessible and
                approachable. Our work spans therapy, trauma care, rehabilitation,
                education, and workplace wellbeing. We aim to create a supportive
                environment where mental health is prioritized and stigma is reduced.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: { xs: 360, md: 540 },
                  bgcolor: 'white',
                  borderRadius: { xs: 6, md: 8 },
                  p: { xs: 3.5, md: 7 },
                  boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <Box component="img"
                    src="/images/story-graphic.png"
                    alt="Healing Pathways"
                    sx={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Mission and Vision Cards */}
        <Grid
          container
          spacing={4}
          sx={{ mb: 8, mx:5, flexDirection: { xs: 'column', sm: 'row' } }}
        >
          {/* Our Mission */}
          <Grid item xs={12} sm={6}>
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
             Our mission is to provide affordable, ethical, and professional mental health support through counselling, therapy, and learning programs. We aim to help people build emotional strength, mental well-being, and long-term personal growth in a safe and supportive environment.

              </Typography>
            </Paper>
          </Grid>

          {/* Our Vision */}
          <Grid item xs={12} sm={6}>
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
               The PSYQ was created by a group of passionate psychologists who wanted to make mental health care easily accessible to everyone. They saw how many people silently struggled with stress, anxiety, depression, and emotional pain, often without anyone to talk to.
                That is why PSYQ was born: a safe and supportive space where people can share, heal, and grow with care and understanding.
                Here, healing is a personal journey. We walk with you through tough times, help you understand your thoughts and emotions, and support you in building a healthier mindset. Along with mental health care, the PSYQ also supports athletes and performers by helping them improve their focus, confidence, and emotional strength.
                At PSYQ, no problem is too small, and no one is ignored. We believe that everyone deserves care, hope, and the opportunity to become stronger.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Features Grid */}
        <Grid container spacing={2} sx={{ mb: 8, px: 5 }}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 2.5,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 56,
                height: 56,
                bgcolor: '#f0f9ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '1.75rem' }}>💡</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                Expert Guidance
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
                Our experienced faculty provides personalized guidance tailored to each student's needs.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 2.5,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 56,
                height: 56,
                bgcolor: '#f0fdf4',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '1.75rem' }}>🧠</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                Psychological Support
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
                We provide counseling services to help students manage stress and build confidence.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 2.5,
              textAlign: 'center',
              height: '100%'
            }}>
              <Box sx={{ 
                width: 56,
                height: 56,
                bgcolor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Box component="span" sx={{ fontSize: '1.75rem' }}>📚</Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                Interactive Learning
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: { xs: '0.8rem', sm: '0.95rem' } }}>
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
              PSYQ started with a simple idea: mental health care should be available to everyone. The founders saw people suffering quietly, unable to find the right support or someone who would truly listen to them.
              To address this, PSYQ was created as a safe space for counselling, therapy, and guidance. Here, healing is considered a personal journey. We support individuals through emotional struggles, help them manage stress, and guide them towards a healthier mindset.
              PSYQ also works in the field of sports psychology, helping athletes build confidence, focus, and emotional balance in sports and life. At PSYQ, every story is important. Every struggle is respected and acknowledged. Every person is supported with care and compassion.
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
