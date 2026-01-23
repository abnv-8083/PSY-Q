import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const BookingModal = ({ open, onClose, packageDetails }) => {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    modeOfTherapy: '',
    primaryConcern: '',
    sessionType: '',
    agreedToTerms: false
  });

  // Available packages
  const packages = [
    {
      id: 'basic',
      name: 'Basic Plan',
      sessions: 4,
      price: 4676,
      pricePerSession: 1299,
      description: '4 Sessions Package',
      savings: '10% OFF'
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      sessions: 8,
      price: 8833,
      pricePerSession: 1299,
      description: '8 Sessions Package',
      popular: true,
      savings: '15% OFF'
    },
    {
      id: 'advanced',
      name: 'Advanced Plan',
      sessions: 12,
      price: 12470,
      pricePerSession: 1039,
      description: '12 Sessions Package',
      savings: '20% OFF'
    }
  ];

  // Available time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day);
  };

  const handleContinue = () => {
    if (step === 1 && selectedPackage) {
      setStep(2);
    } else if (step === 2 && selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBookSession = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !selectedDate || !selectedTime || !formData.agreedToTerms) {
      setErrorMessage('Please complete all required fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Format the selected date
      const bookingDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        selectedDate
      ).toISOString().slice(0, 10);

      const bookingData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        modeOfTherapy: formData.modeOfTherapy,
        primaryConcern: formData.primaryConcern,
        sessionType: formData.sessionType,
        selectedDate: bookingDate,
        selectedTime: selectedTime,
        packageName: selectedPackage ? packages.find(p => p.id === selectedPackage)?.name : '',
        packageDetails: selectedPackage ? packages.find(p => p.id === selectedPackage) : null
      };

      // Call the API endpoint
      const response = await fetch('/api/sendBookingEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message);
        // Reset form
        setTimeout(() => {
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            age: '',
            modeOfTherapy: '',
            primaryConcern: '',
            sessionType: '',
            agreedToTerms: false
          });
          setSelectedPackage(null);
          setSelectedDate(null);
          setSelectedTime(null);
          setStep(1);
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Failed to book session. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#ca0056', color: 'white', position: 'relative', pb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Book Consultation
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
          {step === 1 ? 'Select Package' : step === 2 ? 'Select Date & Time' : 'Your Details'}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
        <LinearProgress
          variant="determinate"
          value={step === 1 ? 33 : step === 2 ? 66 : 100}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white'
            }
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {step === 1 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b', textAlign: 'center' }}>
              Select the package that works best for your therapy journey
            </Typography>
            <Grid container spacing={3}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={4} key={pkg.id}>
                  <Box
                    onClick={() => setSelectedPackage(pkg.id)}
                    sx={{
                      position: 'relative',
                      p: 3,
                      borderRadius: 2,
                      border: 2,
                      borderColor: selectedPackage === pkg.id ? '#ca0056' : '#e5e7eb',
                      bgcolor: selectedPackage === pkg.id ? '#fff0f9' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      '&:hover': {
                        borderColor: '#ca0056',
                        bgcolor: selectedPackage === pkg.id ? '#fff0f9' : '#fef2f2'
                      }
                    }}
                  >
                    {pkg.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: '#ca0056',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 10,
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        Most Popular
                      </Box>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mt: pkg.popular ? 1 : 0 }}>
                      {pkg.description}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ca0056', my: 2 }}>
                      ₹{pkg.price.toLocaleString()}
                    </Typography>
                    {pkg.savings && (
                      <Box
                        sx={{
                          display: 'inline-block',
                          bgcolor: '#fce7f3',
                          color: '#9f1239',
                          px: 2,
                          py: 0.5,
                          borderRadius: 10,
                          fontSize: '11px',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        {pkg.savings}
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                      ₹{pkg.pricePerSession}/session
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : step === 2 ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                Select a Date
              </Typography>
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <IconButton onClick={handlePrevMonth} size="small">
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Typography>
                  <IconButton onClick={handleNextMonth} size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                  {dayNames.map((day) => (
                    <Box key={day} sx={{ textAlign: 'center', fontWeight: 600, fontSize: '14px', color: '#64748b' }}>
                      {day}
                    </Box>
                  ))}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <Box key={`empty-${index}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const isSelected = selectedDate === day;
                    return (
                      <Button
                        key={`day-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
                        onClick={() => handleDateSelect(day)}
                        sx={{
                          minWidth: 0,
                          aspectRatio: '1',
                          borderRadius: 1,
                          bgcolor: isSelected ? '#ca0056' : 'transparent',
                          color: isSelected ? 'white' : '#1e293b',
                          '&:hover': {
                            bgcolor: isSelected ? '#ca0056' : '#f0e2ebff'
                          }
                        }}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                Select a date to see available times
              </Typography>
              {!selectedDate ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 300,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2
                }}>
                  <Box component="span" sx={{ fontSize: '3rem', opacity: 0.3, mb: 2 }}>📅</Box>
                  <Typography sx={{ color: '#64748b', textAlign: 'center' }}>
                    Select a date first
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', mt: 1 }}>
                    All available time slots will appear here
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, maxHeight: 400, overflowY: 'auto' }}>
                  <Grid container spacing={1.5}>
                    {timeSlots.map((time) => (
                      <Grid item xs={6} key={time}>
                        <Button
                          fullWidth
                          onClick={() => setSelectedTime(time)}
                          variant={selectedTime === time ? 'contained' : 'outlined'}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            borderColor: selectedTime === time ? '#ca0056' : '#e5e7eb',
                            bgcolor: selectedTime === time ? '#ca0056' : 'white',
                            color: selectedTime === time ? 'white' : '#1e293b',
                            fontSize: '14px',
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: '#ca0056',
                              bgcolor: selectedTime === time ? '#ca0056' : '#f9e6efff'
                            }
                          }}
                        >
                          {time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        ) : (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Mode of Therapy <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  select
                  placeholder="Select therapy mode"
                  value={formData.modeOfTherapy}
                  onChange={(e) => handleInputChange('modeOfTherapy', e.target.value)}
                  size="small"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Email <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Primary Issue/Concern <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  select
                  placeholder="Select your primary concern"
                  value={formData.primaryConcern}
                  onChange={(e) => handleInputChange('primaryConcern', e.target.value)}
                  size="small"
                >
                  <MenuItem value="anxiety">Anxiety</MenuItem>
                  <MenuItem value="depression">Depression</MenuItem>
                  <MenuItem value="stress">Stress</MenuItem>
                  <MenuItem value="relationship">Relationship Issues</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Phone Number <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Session Type <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  select
                  placeholder="Select your session type"
                  value={formData.sessionType}
                  onChange={(e) => handleInputChange('sessionType', e.target.value)}
                  size="small"
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="couple">Couple</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
                  Age <span style={{ color: '#dc2626' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the <a href="/policies" style={{ color: '#ca0056' }}>Terms and Conditions</a> and{' '}
                      <a href="/policies" style={{ color: '#ca0056' }}>Consent to Therapy</a>{' '}
                      <span style={{ color: '#dc2626' }}>*</span>
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb' }}>
        {(step === 2 || step === 3) && (
          <Button onClick={handleBack} variant="outlined" sx={{ color: '#64748b', borderColor: '#e5e7eb' }}>
            Back
          </Button>
        )}
        {step === 1 ? (
          <>
            <Button onClick={onClose} variant="outlined" sx={{ color: '#64748b', borderColor: '#e5e7eb' }}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              variant="contained"
              disabled={!selectedPackage}
              sx={{
                bgcolor: '#64748b',
                '&:hover': { bgcolor: '#475569' },
                '&:disabled': { bgcolor: '#e5e7eb' }
              }}
            >
              Continue to Schedule
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <Button onClick={onClose} variant="outlined" sx={{ color: '#64748b', borderColor: '#e5e7eb' }}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              variant="contained"
              disabled={!selectedDate || !selectedTime}
              sx={{
                bgcolor: '#64748b',
                '&:hover': { bgcolor: '#475569' },
                '&:disabled': { bgcolor: '#e5e7eb' }
              }}
            >
              Continue to Details
            </Button>
          </>
        ) : (
          <Button
            onClick={handleBookSession}
            variant="contained"
            disabled={!formData.agreedToTerms || isLoading}
            sx={{
              bgcolor: '#64748b',
              '&:hover': { bgcolor: '#475569' },
              '&:disabled': { bgcolor: '#e5e7eb' }
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                Booking...
              </>
            ) : (
              'Book Session'
            )}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default BookingModal;
