import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const Academic = () => {
  const guides = [
    {
      title: 'PSY-Q IGNOU STUDENTS GUIDE',
      description: 'Access comprehensive psychology courses, \nexpertly curated for each of your studies.',
      link: '/soon',
      icon: '/logos/ignou.png'
    },
    {
      title: 'PSY-Q CALICUT STUDENTS GUIDE',
      description: 'Access comprehensive psychology courses, \nexpertly curated for each year of your studies.',
      link: '/soon',
      icon: '/logos/calicut.png'
    }
  ];

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
            // alignItems: 'flex-start',
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

            {/* Cards Section - Inside the pink background */}
          <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>
            {guides.map((guide, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  component={Link}
                  to={guide.link}
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
                    {/* Icon Circle */}
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
                      <img
                        src={guide.icon}
                        alt={guide.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'fill'
                        }}
                      />
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
                        {guide.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#000',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          fontWeight: 400,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {guide.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Academic;            