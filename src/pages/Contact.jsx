import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Box component="main" sx={{ py: { xs: 6, sm: 8, md:10, lg: 10 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md:8, lg: 8 } }}>
          <Typography variant="h2" component="h1" sx={{ mb: 3, fontSize: { xs: 32, sm: 40, lg: 48 } }}>
            Contact Us
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Box>

        {/* Contact Information - Centered */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
            
            {/* Contact Cards */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <EmailIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Email</Typography>
                  <Typography variant="body2" color="text.secondary">psyqonline@gmail.com</Typography>
                
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <PhoneIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Phone</Typography>
                  <Typography variant="body2" color="text.secondary">+919207010098</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Short contact note instead of address/hours to reduce clutter */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Need Help?</Typography>
              <Typography variant="body2" color="text.secondary">
                For quick questions, email us or call during normal business hours. Our team aims to respond within 1 business day.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
