import { useState } from 'react';
import { Box, Container, Typography, IconButton, Card, CardContent } from '@mui/material';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';

const ServicesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const services = [
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Competitive Exam Preparation",
      description: "Comprehensive courses designed to help you excel in various competitive exams with expert guidance and proven strategies.",
      features: ["Mock Tests", "Study Materials", "Performance Analytics", "Personalized Coaching"]
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Career Guidance Webinars",
      description: "Expert-led webinars to help you explore career paths, understand industry trends, and make informed decisions about your future.",
      features: ["Industry Insights", "Career Mapping", "Skill Assessment", "Networking Opportunities"]
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Online Counseling Services",
      description: "Professional psychological support to help you manage stress, build confidence, and maintain mental well-being during your academic journey.",
      features: ["Stress Management", "Confidence Building", "Study Techniques", "Mental Health Support"]
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: "Interactive Learning Modules",
      description: "Engaging digital content with interactive exercises, quizzes, and multimedia resources to enhance your learning experience.",
      features: ["Video Lessons", "Interactive Quizzes", "Progress Tracking", "Mobile Learning"]
    }
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  // Calculate which cards are visible (show 3 cards on desktop, 1 on mobile)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + services.length) % services.length;
      cards.push({
        ...services[index],
        offset: i,
        index: index
      });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <Box component="section" sx={{ py: { xs: 8, sm: 10, lg: 12 }, bgcolor: 'grey.50' }}>
      <Container>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, lg: 8 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', lg: '3rem' }, fontWeight: 'bold', mb: 2 }}>
            Our Services
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
            Comprehensive support services designed to help you achieve your academic and career goals
          </Typography>
        </Box>

        {/* Carousel */}
        <Box sx={{ position: 'relative', maxWidth: '1400px', mx: 'auto' }}>
          {/* Navigation Buttons */}
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: { xs: -10, sm: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowBackIosNew />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: -10, sm: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowForwardIos />
          </IconButton>

          {/* Cards Container */}
          <Box sx={{ overflow: 'hidden', px: { xs: 4, sm: 6 }, py: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                minHeight: '360px'
              }}
            >
              {visibleCards.map((service, idx) => (
                <Box
                  key={service.index}
                  sx={{
                    flex: '0 0 100%',
                    maxWidth: { xs: '100%', md: '33.333%' },
                    px: 2,
                    display: { xs: service.offset === 0 ? 'block' : 'none', md: 'block' },
                    transition: 'all 0.5s ease',
                    opacity: service.offset === 0 ? 1 : 0.5,
                    position: 'relative',
                    zIndex: service.offset === 0 ? 1 : 0
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: service.offset === 0 ? 8 : 2,
                      transition: 'all 0.5s ease',
                      border: service.offset === 0 ? '2px solid' : '2px solid',
                      borderColor: '#1E88E5',
                      '&:hover': {
                        boxShadow: 10
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: '#E91E63',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mb: 1.5
                        }}
                      >
                        {service.icon}
                      </Box>

                      {/* Title */}
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.2rem' }, lineHeight: 1.3 }}>
                        {service.title}
                      </Typography>

                      {/* Description */}
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, lineHeight: 1.5, fontSize: '0.875rem' }}>
                        {service.description}
                      </Typography>

                      {/* Features */}
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 'auto' }}>
                        {service.features.map((feature, featureIndex) => (
                          <Box
                            component="li"
                            key={featureIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 0.75,
                              color: 'text.secondary'
                            }}
                          >
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Dots Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
            {services.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'primary.dark' : 'grey.400'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ServicesCarousel;
