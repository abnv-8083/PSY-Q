import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PublicIcon from '@mui/icons-material/Public';

const About = () => {
  return (
    <Box component="main" sx={{ bgcolor: '#f5f5f5', py: { xs: 7, md: 10 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 3, md: 5 } }}>
        {/* Welcome to PSY-Q Section */}
        <Box sx={{ mb: 8,  px: { xs: 0, sm: 2, md: 10 } }}>
          <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="Non-judgemental Space" 
                icon={<Box component="span" sx={{ fontSize: '11px' }}>🍃</Box>}
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
                Welcome to <Box component="span" sx={{ color: '#ca0056' }}>PSY-Q</Box>
              </Typography>
              <Typography variant="h5" sx={{ 
                color: '#00388C', 
                fontWeight: 500,
                mb: 2,
              }}>
                No mind left behind
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                fontSize: '14px',
                maxWidth: 640
              }}>
                PSY-Q Learning is an initiative introduced by a group of psychologists that
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
                  boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <Box component="img"
                    src="/images/welcome.webp"
                    alt="Healing Pathways"
                    sx={{ width: '100%', height: 'auto', display: 'flex', objectFit: 'contain', borderRadius: 2, }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Mission and Vision Cards */}
        <Grid
          container
          spacing={{ xs: 3, sm: 3, md: 4 }}
          sx={{ mb: 8, px: { xs: 1, sm: 2, md: 5 } }}
        >
          {/* Our Mission */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
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
             Our mission is to provide affordable,ethical and skilled mental health support through counselling, therapy and learning programs. We aim to help people build emotional strength, foster mental well-being, allow healing and personal growth in a supportive environment. We guide passionate psychology learners through in-depth programs that bring psychological concepts to life

              </Typography>
            </Paper>
          </Grid>

          {/* Our Vision */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
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
               The PSY-Q was created by a group of passionate psychologists who wanted to make mental health care easily accessible to everyone. They saw how many people silently struggled with stress, anxiety, depression, and emotional pain, often without anyone to talk to.
                That is why PSY-Q was born: a safe and supportive space where people can share, heal, and grow with care and understanding.
                Here, healing is a personal journey. We walk with you through tough times, help you understand your thoughts and emotions, and support you in building a healthier mindset. Along with mental health care, the PSY-Q also supports athletes and performers by helping them improve their focus, confidence, and emotional strength.
                At PSY-Q, no problem is too small, and no one is ignored. We believe that everyone deserves care, hope, and the opportunity to become stronger.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* The Story Section */}
        <Paper elevation={0} sx={{ 
          bgcolor: 'white',
          borderRadius: 4,
          p: { xs: 3, sm: 4, md: 6 },
          mb: 8,
          mx: { xs: 1, sm: 0 }
        }}>
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.25rem' }
              }}>
                <Box component="span" sx={{ color: '#1e40af' }}>The Story of</Box>{' '}
                <Box component="span" sx={{ color: '#be185d' }}>PSY-Q Learning</Box>
              </Typography>
              <Typography sx={{ 
                color: '#64748b', 
                lineHeight: 1.8,
                mb: 3,
                fontSize: '1rem'
              }}>
              PsyQ was established with a simple idea that mental health care should be accessible to everyone. We observed minds that are suffering quietly, unable to find the right support. Thus PsyQ has been created as a safe space for counselling,  therapy and guidance . It reminds individuals that they are not alone in their struggles, that their emotions are valid, and that healing is possible. PsyQ also works in the field of sports psychology, helping athletes develop confidence, focus, and emotional balance in both sports and life. PsyQ also  help psychology enthusiasts explore psychological concepts through thoughtfully designed learning programs. At PSY Q, every story is heard , every struggle is acknowledged and every emotion is validated
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Meet Our Founders Section */}
        <Box sx={{ 
          bgcolor: '#ca0056',
          p: { xs: 3, sm: 4, md: 8 },
          mb: 8,
          mx: { xs: -3, sm: -2, md: 0 },
          px: { xs: 3, sm: 2, md: 'auto' },
          borderRadius: 4
        }}>
          <Container maxWidth="lg" sx={{ bgcolor: 'transparent', px: { xs: 1, sm: 2, md: 'auto' } }}>
            <Box sx={{ textAlign: 'center', mb: 8}}>
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                mb: 2
              }}>
                they made it happen
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 700,
                color: 'white',
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' }
              }}>
                Trace the behind
              </Typography>
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: { xs: '1rem', md: '1rem' },
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7
              }}>
                Three distinct voices, one shared mission: to redefine mental healthcare with empathy and expertise.
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            {/* Mohammed Sinan*/}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={0} sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                minHeight: 400,
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '350px' },
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: 'slideInUp 0.6s ease-out',
                animationDelay: '0s',
                animationFillMode: 'both',
                '@keyframes slideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(60px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                }
              }}>
                <Box sx={{ 
                  height: 300,
                  bgcolor: '#e8f4f1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box 
                    component="img"
                    src="/images/founders/sinan.jpeg"
                    alt="Mohammed Sinan E"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3, bgcolor: 'rgba(108, 1, 53, 1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    color: 'white',
                    mb: 0.5,
                    fontSize: '1.4rem'
                  }}>
                    Mohammed Sinan E
                  </Typography> */}
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    lineHeight: 1.6
                  }}>
                    "Mental health is the foundation of human potential. Awareness creates understanding, understanding builds empathy, and empathy drives change. Our mission is to normalize care, compassion, and psychological well-being for all."
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Muhammed Salih KC */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={0} sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                minHeight: 400,
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '350px' },
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: 'slideInUp 0.6s ease-out',
                animationDelay: '0.1s',
                animationFillMode: 'both',
                '@keyframes slideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(60px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                }
              }}>
                <Box sx={{ 
                  height: 300,
                  bgcolor: '#e8f4f1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box 
                    component="img"
                    src="/images/founders/salih.jpeg"
                    alt="Muhammed Salih KC"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3, bgcolor: 'rgba(108, 1, 53, 1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    lineHeight: 1.6
                  }}>
                    "Mental health awareness empowers individuals to speak, seek, and heal. When minds are supported, communities grow stronger. We strive to replace stigma with strength through education, connection, and accessible mental health support."
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Umair Abdul Latheef */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={0} sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                minHeight: 400,
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '350px' },
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: 'slideInUp 0.6s ease-out',
                animationDelay: '0.2s',
                animationFillMode: 'both',
                '@keyframes slideInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(60px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
                }
              }}>
                <Box sx={{ 
                  height: 300,
                  bgcolor: '#e8f4f1',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box 
                    component="img"
                    src="/images/founders/umair.jpeg"
                    alt="Umair Abdul Latheef"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3, bgcolor: 'rgba(108, 1, 53, 1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    lineHeight: 1.6
                  }}>
                    "Mental well-being is not a luxury but a necessity. Sustainable systems must prioritize emotional health. Our commitment is to build supportive environments where people feel valued, heard, and mentally resilient every day."
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Paper elevation={0} sx={{ 
          bgcolor: 'white',
          borderRadius: 4,
          p: { xs: 3, sm: 4, md: 6 },
          textAlign: 'center',
          mx: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}>
            Choose PSYQ So the <Box component="span" sx={{ color: '#ca0056' }}>future feels lighter</Box>, and your <Box component="span" sx={{ color: '#ca0056' }}>smile feels real again</Box>.
          </Typography>
          <Typography sx={{ 
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            color: '#64748b',
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
            px: { xs: 1, sm: 0 }
          }}>
            Join thousands of individuals who have achieved their goals with Psy-Q's comprehensive support system.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', px: { xs: 2, sm: 0 } }}>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <Box
                component="button"
                sx={{
                  bgcolor: '#ca0056',
                  color: 'white',
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  border: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#e60073'
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
