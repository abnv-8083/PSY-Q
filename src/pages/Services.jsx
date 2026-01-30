import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';

const Services = () => {
  const services = [
    {
      title: "Individual Therapy",
      image: "/services/individual.webp",
      // route: "/individual"
    },
    {
      title: "Child Rehabilitation Counselling",
      image: "/services/child-rehabilation.webp",
      // route: "/child-rehabilitation"
    },
    {
      title: "Couple Counselling",
      image: "/services/couple.webp",
      // route: "/couple-counseling"
    },
    {
      title: "Psychospiritual and Meditation",
      image: "/services/spiritual.webp",
      // route: "/psychospiritual"
    },
    {
      title: "Sexual Wellness",
      image: "/services/sexual-wellness.webp",
      // route: "/sexual-wellness"
    },
    {
      title: "Sports Mental Health Services",
      image: "/services/sports-counselling.webp",
      // route: "/sports-mental-health"
    }
  ];

  return (
    <Box component="main" sx={{ bgcolor: '#b00f4aff', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 700,
            color: 'white',
            mb: 3,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Our Services
          </Typography>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: { xs: '14px', md: '14px' },
            maxWidth: '800px',
            mx: 'auto'
          }}>
            Comprehensive mental health and wellness services tailored to your needs
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={4} md={4} key={index}>
              <Card sx={{
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ml: 2,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={service.image}
                  alt={service.title}
                  sx={{ 
                    objectFit: 'cover',
                    minHeight: 280,
                    maxHeight: 280
                  }}
                />
                <CardContent sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  bgcolor: 'rgba(230, 255, 250, 0.5)',
                  minHeight: 160
                }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: '#00388C',
                    mb: 2,
                    textAlign: 'center',
                    minHeight: 64,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {service.title}
                  </Typography>
                  {/* <Link to={service.route} style={{ textDecoration: 'none', width: '100%' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#ca0056',
                        color: '#fff',
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#F2B8C1',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Book Now
                    </Button>
                  </Link> */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Services;
