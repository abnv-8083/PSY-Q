import { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Chip, Table, TableBody, TableCell, TableRow } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import BookingModal from '../components/BookingModal';

const CoupleCounseling = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBookNow = (pkg) => {
    setSelectedPackage({ ...pkg, serviceName: 'Couple Counseling services' });
    setModalOpen(true);
  };
  
  const packages = [
    {
      name: "Starter",
      description: "1 Session, Experience our service",
      price: "₹999",
      color: "#d4887d",
      bgColor: "linear-gradient(135deg, #F2B8C1 0%, #dcadb4ff 100%)"
    },
    {
      name: "Basic",
      description: "Best for offering multiple experiences",
      price: "₹3200",
      color: "#7d9fb3",
      bgColor: "linear-gradient(135deg, #c5e4f8 0%, #8fbdd8 100%)",
      popular: true
    },
    {
      name: "Standard",
      description: "Best for global, complex use cases",
      price: "₹6000",
      color: "#8fae8d",
      bgColor: "linear-gradient(135deg, #e6b0f6 0%, #ca95d9ff 100%)"
    },
    {
      name: "Advanced",
      description: "Best for global, complex use cases",
      price: "₹8400",
      color: "#8fae8d",
      bgColor: "linear-gradient(135deg, #B3CED6 0%, #93bcc8 100%)"
    }
  ];

  const features = [
    { name: "Hosting & Visualization of 3D Assets*", essentials: true, professional: true, enterprise: true },
    { name: "Configuration", essentials: true, professional: true, enterprise: true },
    { name: "Analytics", essentials: true, professional: true, enterprise: true },
    { name: "Augmented Reality", essentials: false, professional: true, enterprise: true },
    { name: "Virtual Photographer", essentials: false, professional: true, enterprise: true },
    { name: "Threekit AI", essentials: false, professional: true, enterprise: true }
  ];

return (
    <Box component="main" sx={{ bgcolor: '#ca0056', py: { xs: 4, sm: 6, md: 8, lg: 10 }, px: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, sm: 4 }} sx={{ mb: { xs: 4, sm: 6 } }}>
          <Grid item xs={12} md={4} sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h2" sx={{ 
              fontWeight: 300,
              color: 'white',
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3rem' }
            }}>
              Simple <Box component="span" sx={{ color: 'rgba(255, 255, 255, 0.73)' }}>pricing</Box>
            </Typography>
            <Typography sx={{ 
              color: 'white',
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem', lg: '1.5rem' },
              fontWeight: 300,
              lineHeight: 1.3
            }}>
              choose <br />your package
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              {packages.map((pkg, index) => (
                <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
                  <Paper sx={{
                    borderRadius: { xs: 2, sm: 3, md: 2 },
                    p: { xs: 2.5, sm: 3 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: pkg.bgColor,
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    minHeight: { xs: 'auto', sm: 280 }
                  }}>
                    {pkg.popular && (
                      <Chip 
                        label="Most Popular!"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: 'rgba(0,0,0,0.2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '14px',
                          height: 24
                        }}
                      />
                    )}
                    
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      color: 'white',
                      mb: { xs: 0.75, sm: 1 },
                      fontSize: { xs: '14px', sm: '14px', md: '14px', lg: '14px' }
                    }}>
                      {pkg.name}
                    </Typography>
                    
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.95)',
                      fontSize: { xs: '14px', sm: '14px' },
                      mb: { xs: 2, sm: 3 },
                      minHeight: { xs: 36, sm: 40 },
                      lineHeight: 1.4
                    }}>
                      {pkg.description}
                    </Typography>
                    
                    <Typography variant="h4" sx={{ 
                      fontWeight: 600,
                      color: 'white',
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: '14px', sm: '14px', md: '14px' }
                    }}>
                      {pkg.price}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleBookNow(pkg)}
                      sx={{
                        bgcolor: '#ca0056',
                        color: 'white',
                        py: { xs: 1.25, sm: 1.5 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        fontWeight: 600,
                        fontSize: { xs: '14px', sm: '14px' },
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: '#ca0056',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }
                      }}
                    >
                      Get started
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Key Features Table */}
        <Box sx={{ mt: { xs: 6, sm: 8 } }}>
          <Typography variant="h4" sx={{ 
            color: 'white',
            mb: { xs: 3, sm: 4 },
            fontWeight: 600,
            fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2rem' }
          }}>
            Key Features
          </Typography>
          
          <Box sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            overflowX: { xs: 'auto', md: 'visible' },
            '&::-webkit-scrollbar': {
              height: 8
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'rgba(255,255,255,0.05)'
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 4
            }
          }}>
            {features.map((feature, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: { xs: 2, sm: 2.5 },
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  minWidth: { xs: 600, md: 'auto' }
                }}
              >
                <Box sx={{ flex: 1, pr: { xs: 2, sm: 3 }, minWidth: { xs: 200, sm: 'auto' } }}>
                  <Typography sx={{ color: 'white', fontSize: '14px' }}>
                    {feature.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: { xs: 4, sm: 5, md: 6 }, minWidth: { xs: 280, sm: 320, md: 380 } }}>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 60 }}>
                    {feature.essentials ? (
                      <CheckCircleIcon sx={{ color: '#F2B8C1', fontSize: { xs: 20, sm: 24 } }} />
                    ) : (
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>-</Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 60 }}>
                    {feature.professional ? (
                      <CheckCircleIcon sx={{ color: '#c5e4f8', fontSize: { xs: 20, sm: 24 } }} />
                    ) : (
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>-</Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 60 }}>
                    {feature.enterprise ? (
                      <CheckCircleIcon sx={{ color: '#e6b0f6', fontSize: { xs: 20, sm: 24 } }} />
                    ) : (
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>-</Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 60 }}>
                      {feature.enterprise ? (
                        <CheckCircleIcon sx={{ color: '#B3CED6', fontSize: { xs: 20, sm: 24 } }} />
                      ) : (
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>-</Typography>
                      )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        packageDetails={selectedPackage}
      /> */}
    </Box>
  );
};

export default CoupleCounseling;
