import { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BookingModal from '../components/BookingModal';

const Individual = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBookNow = (pkg) => {
    setSelectedPackage({ ...pkg, serviceName: 'Individual therapy' });
    setModalOpen(true);
  };
  const packages = [
    {
      name: "Basic Growth Plan",
      sessions: "4 Sessions",
      price: "₹800",
      pricePerSession: "per session",
      totalPrice: "₹3200",
      discount: "Save 20%",
      tagline: "Start your journey towards clarity",
      features: [
        "Build deeper trust and rapport with your therapist",
        "Understand your emotional patterns with guided support",
        "Gain clarity around your thoughts, behaviours, and reactions",
        "Receive structured, personalised guidance",
        "Experience continuous support and care throughout the process",
        "FREE 4-month access to SPACE by Psyra (journaling, mood tracking, daily reflections)"
      ]
    },
    {
      name: "Deep Healing Plan",
      sessions: "8 Sessions",
      price: "₹750",
      pricePerSession: "per session",
      totalPrice: "₹6000",
      discount: "Save 25%",
      tagline: "Go deeper and heal stronger.",
      features: [
        "Work through long-standing emotional patterns with consistent guidance",
        "Identify root causes behind recurring thoughts and feelings",
        "Anytime chat support between sessions",
        "Explore emotions through structured therapeutic exercises",
        "One exclusive offline event entry",
        "FREE access to SPACE by Psyra (track progress, reflect daily, build healthier habits)"
      ],
      popular: true
    },
    {
      name: "Premium Plan",
      sessions: "12 Sessions",
      price: "₹600",
      pricePerSession: "per session",
      totalPrice: "₹8400",
      discount: "Save 30%",
      tagline: "Your complete support system.",
      features: [
        "12 personalised therapy sessions for long-term emotional transformation",
        "Free access to all Online Psyra Events",
        "One exclusive offline event entry",
        "24/7 call & chat support for continuous emotional care",
        "Build emotional consistency with structured guidance",
        "FREE 1-year access to SPACE by Psyra (daily routines, emotional check-ins, habit building & guided growth tools)"
      ]
    }
  ];

  return (
    <Box component="main" sx={{ bgcolor: '#ca0056', py: { xs: 6, sm: 8, md: 10 }, px: { xs: 2, sm: 0 }, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 400,
            color: 'white',
            mb: 3,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
            letterSpacing: '0.5px'
          }}>
            Choose The <Box component="span" sx={{ fontWeight: 700 }}>Package</Box> for you
          </Typography>
          {/* <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: '#ca0056',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f0f0f0'
              }
            }}
          >
            Why Package? ⌄
          </Button> */}
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ flexWrap: 'nowrap',alignItems: 'stretch' }}>
          {packages.map((pkg, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
              <Paper sx={{
                borderRadius: 2,
                p: { xs: 2, sm: 2.5, md: 2 },
                width: '100%',
                minHeight: { xs: 'auto', sm: 600, md: 600 },
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'rgba(255, 230, 242, 0.7)',
                position: 'relative',
                animation: 'slideInUp 0.6s ease-out',
                animationDelay: `${index * 0.1}s`,
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
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    {pkg.name}
                  </Typography>
                  <Chip 
                    label={pkg.discount}
                    sx={{
                      bgcolor: 'rgba(202, 0, 86, 0.2)',
                      color: '#ca0056',
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', sm: '0.85rem' },
                      py: 0.5
                    }}
                  />
                </Box>

                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.85rem', sm: '0.95rem' }, mb: 1 }}>
                  {pkg.sessions} · {pkg.price} {pkg.pricePerSession}
                </Typography>

                <Typography sx={{ 
                  color: '#1e293b',
                  fontStyle: 'italic',
                  mb: 3,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' }
                }}>
                  {pkg.tagline}
                </Typography>

                <Box sx={{ flexGrow: 1, mb: 3 }}>
                  {pkg.features.map((feature, featureIndex) => (
                    <Box key={featureIndex} sx={{ display: 'flex', mb: { xs: 1.5, sm: 2 }, alignItems: 'flex-start' }}>
                      <CheckIcon sx={{ color: '#ca0056', fontSize: { xs: 16, sm: 18 }, mr: 1, mt: 0.3, flexShrink: 0 }} />
                      <Typography sx={{ color: '#1e293b', fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.5 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 3,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
                  }}>
                    {pkg.totalPrice}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleBookNow(pkg)}
                    sx={{
                      bgcolor: 'white',
                      color: '#1e293b',
                      py: { xs: 1.25, sm: 1.5 },
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#f0f0f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        packageDetails={selectedPackage}
      />
    </Box>
  );
};

export default Individual;
