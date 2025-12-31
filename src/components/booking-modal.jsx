"use client"

import { useState, useMemo } from "react"
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { CheckCircle, Calendar } from "lucide-react"

// Progress indicator
const ProgressBar = ({ currentStep, totalSteps }) => {
  const value = useMemo(() => (currentStep / totalSteps) * 100, [currentStep, totalSteps])
  return (
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{ height: 8, borderRadius: 9999, backgroundColor: "#e5e7eb", "& .MuiLinearProgress-bar": { backgroundColor: "#050bcb" } }}
    />
  )
}

const SectionHeader = ({ title, step, onClose }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
    <Box>
      <Typography variant="h5" fontWeight={700} color="#111827">
        {title}
      </Typography>
      <Typography variant="body2" color="#4b5563" sx={{ mt: 0.5 }}>
        Step {step} of 4
      </Typography>
    </Box>
    {onClose && (
      <IconButton onClick={onClose} aria-label="Close" sx={{ color: "#4b5563" }}>
        <CloseIcon />
      </IconButton>
    )}
  </Stack>
)

// Step 1: Choose Therapy Type
const Step1_TherapyType = ({ onNext, onClose, selectedTherapy, setSelectedTherapy }) => {
  const therapyTypes = [
    { id: "individual", title: "Individual Therapy", description: "One-on-one sessions with a licensed therapist" },
    { id: "couple", title: "Couple Therapy", description: "Joint sessions for couples and partners" },
  ]

  return (
    <Box p={4} display="flex" flexDirection="column" height="100%" gap={3}>
      <SectionHeader title="Choose Therapy Type" subtitle="Step 1 of 4" step={1} onClose={onClose} />

      <ProgressBar currentStep={1} totalSteps={4} />

      <Typography textAlign="center" color="#4b5563">
        Select the type of therapy that best suits your needs
      </Typography>

      <Stack spacing={2}>
        {therapyTypes.map((therapy) => {
          const active = selectedTherapy === therapy.id
          return (
            <Paper
              key={therapy.id}
              onClick={() => setSelectedTherapy(therapy.id)}
              variant="outlined"
              sx={{
                borderColor: active ? "#CA0056" : "#e5e7eb",
                bgcolor: active ? "#fff0f9" : "white",
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                transition: "all 0.2s ease",
                '&:hover': { borderColor: "#CA0056" },
              }}
            >
              <Typography sx={{ fontSize: 24, minWidth: 32 }}>{active ? "✓" : therapy.icon}</Typography>
              <Box flex={1}>
                <Typography fontWeight={600} color="#111827">
                  {therapy.title}
                </Typography>
                <Typography color="#4b5563" fontSize={13} sx={{ mt: 0.5 }}>
                  {therapy.description}
                </Typography>
              </Box>
              {active && (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "#CA0056",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
              )}
            </Paper>
          )
        })}
      </Stack>

      {selectedTherapy && (
        <Paper
          sx={{
            p: 2,
            bgcolor: "#fff0f9",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CheckCircle size={20} color="#CA0056" />
          <Typography fontSize={13} fontWeight={500} color="#CA0056">
            {therapyTypes.find((t) => t.id === selectedTherapy)?.title} Selected - You can proceed to select your package
          </Typography>
        </Paper>
      )}

      <Divider sx={{ mt: 1 }} />
      <Stack direction="row" spacing={2} pt={2}>
        <Button onClick={onClose} variant="outlined" fullWidth sx={{ borderColor: "#ca0056", color: "#ca0056" }}>
          Cancel
        </Button>
        <Button
          onClick={onNext}
          fullWidth
          variant="contained"
          disabled={!selectedTherapy}
          sx={{ bgcolor: selectedTherapy ? "#ca0056" : "#d1d5db", '&:hover': { bgcolor: selectedTherapy ? "#b0004c" : "#d1d5db" } }}
        >
          Continue to Packages
        </Button>
      </Stack>
    </Box>
  )
}

// Step 2: Select Package
const Step2_Package = ({ onNext, onBack, selectedPackage, setSelectedPackage }) => {
  const packages = [
    { id: "single", title: "Single Session", price: "₹999", description: "Perfect for a first-time session", popular: false, savings: null },
    { id: "8sessions", title: "8 Sessions Package", price: "₹6000", description: "Best value for ongoing therapy", popular: true, savings: "25% OFF" },
    { id: "24sessions", title: "24 Sessions Package", price: "₹14400", description: "Maximum savings with commitment", popular: false, savings: "40% OFF" },
  ]

  return (
    <Box p={4} display="flex" flexDirection="column" height="100%" gap={3}>
      <SectionHeader title="Select Package" subtitle="Step 2 of 4" step={2} />
      <ProgressBar currentStep={2} totalSteps={4} />
      <Typography textAlign="center" color="#4b5563">
        Select the package that works best for your therapy journey
      </Typography>

      <Grid container spacing={2}>
        {packages.map((pkg) => {
          const active = selectedPackage === pkg.id
          return (
            <Grid item xs={12} md={4} key={pkg.id}>
              <Paper
                onClick={() => setSelectedPackage(pkg.id)}
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderColor: active ? "#CA0056" : "#e5e7eb",
                  bgcolor: active ? "#fff0f9" : "white",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  '&:hover': { borderColor: "#CA0056" },
                }}
              >
                {pkg.popular && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      bgcolor: "#CA0056",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                )}
                <Typography fontWeight={700} color="#111827" sx={{ mt: pkg.popular ? 1 : 0 }}>
                  {pkg.title}
                </Typography>
                <Typography fontSize={28} fontWeight={700} color="#CA0056" sx={{ my: 1.5 }}>
                  {pkg.price}
                </Typography>
                {pkg.savings && (
                  <Chip
                    label={pkg.savings}
                    size="small"
                    sx={{ bgcolor: "#fce7f3", color: "#9f1239", fontWeight: 600, mb: 1.5 }}
                  />
                )}
                <Typography color="#4b5563" fontSize={13}>
                  {pkg.description}
                </Typography>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <Divider />
      <Stack direction="row" spacing={2} pt={2}>
        <Button onClick={onBack} variant="outlined" fullWidth sx={{ borderColor: "#ca0056", color: "#ca0056" }}>
          Back
        </Button>
        <Button
          onClick={onNext}
          fullWidth
          variant="contained"
          disabled={!selectedPackage}
          sx={{ bgcolor: selectedPackage ? "#ca0056" : "#fce7f3", '&:hover': { bgcolor: selectedPackage ? "#b0004c" : "#fce7f3" } }}
        >
          Continue to Schedule
        </Button>
      </Stack>
    </Box>
  )
}

// Step 3: Select Date & Time
const Step3_DateTime = ({ onNext, onBack, selectedDate, setSelectedDate, selectedTime, setSelectedTime }) => {
  const timeSlots = ["07:00 PM – 08:00 PM", "08:00 PM – 09:00 PM", "09:00 PM – 10:00 PM"]

  return (
    <Box p={4} display="flex" flexDirection="column" height="100%" gap={3}>
      <SectionHeader title="Select Date & Time" subtitle="Step 3 of 4" step={3} />
      <ProgressBar currentStep={3} totalSteps={4} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography fontWeight={600} color="#111827" sx={{ mb: 1 }}>
            Select a Date
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
          />
          {selectedDate && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
              <Calendar size={16} color="#4b5563" />
              <Typography fontSize={13} color="#4b5563">
                Selected: {new Date(selectedDate).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography fontWeight={600} color="#111827" sx={{ mb: 1 }}>
            Available Time Slots
          </Typography>
          {selectedDate ? (
            <Stack spacing={1}>
              {timeSlots.map((slot) => {
                const active = selectedTime === slot
                return (
                  <Button
                    key={slot}
                    fullWidth
                    variant={active ? "contained" : "outlined"}
                    onClick={() => setSelectedTime(slot)}
                    sx={{
                      justifyContent: "flex-start",
                      borderColor: active ? "#CA0056" : "#d1d5db",
                      bgcolor: active ? "#fff0f9" : "white",
                      color: active ? "#ab145a" : "#374151",
                      '&:hover': { borderColor: "#CA0056" },
                    }}
                  >
                    {slot}
                  </Button>
                )
              })}
            </Stack>
          ) : (
            <Typography color="#6b7280" textAlign="center" sx={{ py: 4 }}>
              Select a date first to see available times
            </Typography>
          )}
        </Grid>
      </Grid>

      <Divider />
      <Stack direction="row" spacing={2} pt={2}>
        <Button onClick={onBack} variant="outlined" fullWidth sx={{ borderColor: "#ca0056", color: "#ca0056" }}>
          Back
        </Button>
        <Button
          onClick={onNext}
          fullWidth
          variant="contained"
          disabled={!selectedDate || !selectedTime}
          sx={{ bgcolor: selectedDate && selectedTime ? "#ca0056" : "#d1d5db", '&:hover': { bgcolor: selectedDate && selectedTime ? "#b0004c" : "#d1d5db" } }}
        >
          Continue to Details
        </Button>
      </Stack>
    </Box>
  )
}

// Step 4: Personal Details
const Step4_PersonalDetails = ({ onBack, onSubmit, formData, setFormData }) => {
  const [agreed, setAgreed] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const requiredFilled = formData.fullName && formData.email && formData.phone

  return (
    <Box p={4} display="flex" flexDirection="column" height="100%" gap={3}>
      <SectionHeader title="Personal Details" subtitle="Step 4 of 4" step={4} />
      <ProgressBar currentStep={4} totalSteps={4} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Mode of Therapy</InputLabel>
            <Select
              label="Mode of Therapy"
              name="therapyMode"
              value={formData.therapyMode}
              onChange={handleInputChange}
            >
              <MenuItem value="">Select therapy mode</MenuItem>
              <MenuItem value="video">Video Call</MenuItem>
              <MenuItem value="phone">Phone Call</MenuItem>
              <MenuItem value="inperson">In Person</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Primary Issue/Concern</InputLabel>
            <Select
              label="Primary Issue/Concern"
              name="primaryConcern"
              value={formData.primaryConcern}
              onChange={handleInputChange}
            >
              <MenuItem value="">Select your primary concern</MenuItem>
              <MenuItem value="anxiety">Anxiety</MenuItem>
              <MenuItem value="depression">Depression</MenuItem>
              <MenuItem value="relationship">Relationship Issues</MenuItem>
              <MenuItem value="stress">Stress Management</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Session Type</InputLabel>
            <Select
              label="Session Type"
              name="sessionType"
              value={formData.sessionType}
              onChange={handleInputChange}
            >
              <MenuItem value="">Select your session type</MenuItem>
              <MenuItem value="regular">Regular Therapy</MenuItem>
              <MenuItem value="crisis">Crisis Support</MenuItem>
              <MenuItem value="consultation">Consultation</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, bgcolor: "#f9fafb", display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
          label={
            <Typography fontSize={13} color="#374151">
              I agree to the <Box component="a" href="#" sx={{ color: "#CA0056", textDecoration: "underline" }}>Terms and Conditions</Box> and <Box component="a" href="#" sx={{ color: "#CA0056", textDecoration: "underline" }}>Consent to Therapy</Box>
            </Typography>
          }
        />
      </Paper>

      <Divider />
      <Stack direction="row" spacing={2} pt={2}>
        <Button onClick={onBack} variant="outlined" fullWidth sx={{ borderColor: "#ca0056", color: "#ca0056" }}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          fullWidth
          variant="contained"
          disabled={!agreed || !requiredFilled}
          sx={{ bgcolor: agreed && requiredFilled ? "#ca0056" : "#d1d5db", '&:hover': { bgcolor: agreed && requiredFilled ? "#b0004c" : "#d1d5db" } }}
        >
          Book Session
        </Button>
      </Stack>
    </Box>
  )
}

// Main BookingModal component
export default function BookingModal({ isOpen, therapist, onClose }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTherapy, setSelectedTherapy] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    therapyMode: "",
    primaryConcern: "",
    sessionType: "",
  })

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = () => {
    console.log("Booking submitted:", {
      therapist: therapist?.name,
      therapyType: selectedTherapy,
      package: selectedPackage,
      date: selectedDate,
      time: selectedTime,
      personalDetails: formData,
    })
    setCurrentStep(1)
    setSelectedTherapy("")
    setSelectedPackage("")
    setSelectedDate("")
    setSelectedTime("")
    setFormData({ fullName: "", email: "", phone: "", age: "", therapyMode: "", primaryConcern: "", sessionType: "" })
    onClose()
  }

  return (
    <Dialog open={!!isOpen} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, height: 750 } }}>
      <DialogContent sx={{ p: 0, height: "100%" }}>
        {currentStep === 1 && (
          <Step1_TherapyType
            onNext={handleNext}
            onClose={onClose}
            selectedTherapy={selectedTherapy}
            setSelectedTherapy={setSelectedTherapy}
          />
        )}
        {currentStep === 2 && (
          <Step2_Package
            onNext={handleNext}
            onBack={handleBack}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
          />
        )}
        {currentStep === 3 && (
          <Step3_DateTime
            onNext={handleNext}
            onBack={handleBack}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        )}
        {currentStep === 4 && (
          <Step4_PersonalDetails
            onBack={handleBack}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
