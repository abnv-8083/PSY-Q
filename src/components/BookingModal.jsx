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
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const BookingModal = ({ open, onClose, packageDetails }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBookSession = () => {
    console.log('Booking session with:', { ...formData, selectedDate, selectedTime });
    onClose();
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
          {packageDetails?.name} - {packageDetails?.serviceName} - {step === 1 ? 'Select Date & Time' : 'Your Details'}
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
          value={step === 1 ? 50 : 100}
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
        {step === 1 ? (
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
                    <Box key={day} sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: '#64748b' }}>
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
                        key={day}
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
                            fontSize: '0.9rem',
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
                      I agree to the <a href="#" style={{ color: '#ca0056' }}>Terms and Conditions</a> and{' '}
                      <a href="#" style={{ color: '#ca0056' }}>Consent to Therapy</a>{' '}
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
        {step === 2 && (
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
            disabled={!formData.agreedToTerms}
            sx={{
              bgcolor: '#64748b',
              '&:hover': { bgcolor: '#475569' },
              '&:disabled': { bgcolor: '#e5e7eb' }
            }}
          >
            Book Session
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default BookingModal;
