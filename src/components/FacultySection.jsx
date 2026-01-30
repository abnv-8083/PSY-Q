import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const FacultySection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const facultyMembers = [
    {
      id: 1,
      name: "Suhail VH",
      title: "Consultant psychologist",
      image: "/images/faculty/suhail.jpeg",
    },
    {
      id: 2,
      name: "Kallu Sajeev",
      title: "Corporate Wellbeing coach & Consultant Psychologist",
      image: "/images/faculty/kallu.jpeg",
    },
    {
      id: 3,
      name: "Nasif Ahmed",
      title: "Consultant Psychologist",
      image: "/images/faculty/nasif.jpeg",
    },
    {
      id: 4,
      name: "Parvathi K",
      title: "Sports Psychologist",
      image: "/images/faculty/parvathi.jpeg",
    },
    {
      id: 5,
      name: "Nafih PK",
      title: "Sports Psychologist",
      image: "/images/faculty/nafih.jpeg",
    },
    {
      id: 6,
      name: "Gazzala Tharola",
      title: "Consultant Psychologist and Assistant professor",
      image: "/images/faculty/gazzala.jpeg",
    }
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? facultyMembers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === facultyMembers.length - 1 ? 0 : prev + 1));
  };

  // Get visible cards (5 total, with current in center)
  const getVisibleCards = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + facultyMembers.length) % facultyMembers.length;
      visible.push({ ...facultyMembers[index], offset: i });
    }
    return visible;
  };

  const visibleCards = getVisibleCards();

  return (
    <Box component="section" sx={{ py: { xs: 8, sm: 10, lg: 12 },background: 'linear-gradient(0deg, rgba(236, 233, 230, 0.62) 0%, rgba(255, 255, 255, 1) 100%)' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, lg: 8 } }}>
          {/* <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              mb: 2, 
              fontSize: { xs: 32, sm: 40, lg: 48 }, 
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'text.secondary'
            }}
          >
            Meet Our Therapists
          </Typography> */}
          <Typography variant="body1" color="text.secondary" fontStyle="italic" sx={{ fontSize: { xs: 14, sm: 14 } }}>
            Find the right therapist for your journey to wellness.
          </Typography>
        </Box>

        {/* Carousel */}
        <Box sx={{ position: 'relative', mb: 6 }}>
          {/* Navigation Buttons */}
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: { xs: -10, sm: 0 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: -10, sm: 0 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>

          {/* Cards Container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 2, sm: 3, md: 4 },
              px: { xs: 6, sm: 8 },
              minHeight: 450,
              overflow: 'hidden'
            }}
          >
            {visibleCards.map((faculty, idx) => {
              const isCenter = faculty.offset === 0;
              const scale = isCenter ? 1 : 0.7;
              const opacity = Math.abs(faculty.offset) === 2 ? 0.3 : Math.abs(faculty.offset) === 1 ? 0.6 : 1;

              return (
                <Box
                  key={`${faculty.id}-${idx}`}
                  sx={{
                    display: { xs: Math.abs(faculty.offset) > 1 ? 'none' : 'flex', sm: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.4s ease',
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    flex: isCenter ? '0 0 280px' : '0 0 200px',
                  }}
                >
                  {/* Alternative Image Label */}
                  {!isCenter && (
                    <Typography
                      variant="caption"
                      sx={{
                        mb: 1,
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}
                    >
                    </Typography>
                  )}

                  {/* Profile Image */}
                  <Box
                    sx={{
                      width: isCenter ? 280 : 200,
                      height: isCenter ? 280 : 200,
                      borderRadius: '50%',
                      bgcolor: '#6383b4ff',
                      mb: 2,
                      overflow: 'hidden',
                      border: isCenter ? '4px solid #00388C' : 'none',
                      boxShadow: isCenter ? 3 : 1
                    }}
                  >
                    <Box
                      component="img"
                      src={faculty.image}
                      alt={faculty.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>

                  {/* Name and Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: isCenter ? 14 : 14,
                      mb: 0.5,
                      textAlign: 'center'
                    }}
                  >
                    {faculty.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: isCenter ? 14 : 12,
                      mb: 2,
                      textAlign: 'center'
                    }}
                  >
                    {faculty.title}
                  </Typography>

                  {/* Book Now Button */}
                  {/* <Button
                    variant="outlined"
                    sx={{
                      borderRadius: 20,
                      px: 3,
                      py: 0.75,
                      fontSize: isCenter ? 14 : 12,
                      textTransform: 'none',
                      borderColor: '#00388c',
                      color: '#00388c',
                      '&:hover': {
                        borderColor: '#138496',
                        bgcolor: 'rgba(23, 162, 184, 0.04)'
                      }
                    }}
                  >
                    Get to Know me
                  </Button> */}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* View All Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Link to="/therapists" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#00388c',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 25,
                fontSize: 16,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#256edcff'
                }
              }}
            >
              View all therapists
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default FacultySection;
