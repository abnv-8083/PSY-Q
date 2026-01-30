import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            bgcolor: '#f4f6f8',
            p: 3
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              maxWidth: 600, 
              width: '100%',
              borderRadius: 4
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ p: 2, bgcolor: '#fee2e2', borderRadius: '50%' }}>
                <AlertTriangle size={48} color="#ef4444" />
              </Box>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1f2937' }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 4 }}>
              We're sorry, but the application has encountered an unexpected error.
              <br />
              {this.state.error && this.state.error.toString()}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<Home size={18} />}
                onClick={this.handleGoHome}
                sx={{ borderRadius: 2 }}
              >
                Go Home
              </Button>
              <Button 
                variant="contained" 
                startIcon={<RefreshCcw size={18} />}
                onClick={this.handleReset}
                sx={{ borderRadius: 2, bgcolor: '#E91E63' }}
              >
                Reload Page
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Component Stack:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#1a1a1a', 
                    color: '#fff', 
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    maxHeight: 200
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
