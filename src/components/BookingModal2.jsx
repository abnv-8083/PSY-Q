"use client"

import { useState } from "react"
import { CheckCircle, Calendar } from "lucide-react"


// Modal wrapper component
const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      style={{
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-y-auto relative"
        style={{
          width: "700px",
          height: "750px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#ffffff",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Progress indicator
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div
      className="h-2 bg-gray-200 rounded-full overflow-hidden"
      style={{
        height: "8px",
        backgroundColor: "#e5e7eb",
        borderRadius: "9999px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "#050bcbff",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  )
}

// Step 1: Choose Therapy Type
const Step1_TherapyType = ({ onNext, onClose, selectedTherapy, setSelectedTherapy }) => {
  const therapyTypes = [
    {
      id: "individual",
      title: "Individual Therapy",
      description: "One-on-one sessions with a licensed therapist",
    },
    {
      id: "couple",
      title: "Couple Therapy",
      description: "Joint sessions for couples and partners",
    },
  ]

  return (
    <div className="p-8" style={{ padding: "32px" }}>
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-gray-900"
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Choose Therapy Type
          </h2>
          <p
            className="text-gray-600 text-sm mt-2"
            style={{
              color: "#4b5563",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            Step 1 of 4
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-3xl text-gray-600 hover:text-gray-900 font-light"
          style={{
            fontSize: "30px",
            color: "#4b5563",
            cursor: "pointer",
            border: "none",
            background: "none",
            transition: "color 0.2s ease",
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar currentStep={1} totalSteps={4} />
      </div>

      {/* Subtitle */}
      <p
        className="text-gray-600 text-center mb-8"
        style={{
          color: "#4b5563",
          textAlign: "center",
          marginBottom: "32px",
          fontSize: "15px",
        }}
      >
        Select the type of therapy that best suits your needs
      </p>

      {/* Therapy type cards */}
      <div className="space-y-4 mb-8" style={{ gap: "16px", marginBottom: "32px" }}>
        {therapyTypes.map((therapy) => (
          <div
            key={therapy.id}
            onClick={() => setSelectedTherapy(therapy.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTherapy === therapy.id ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            style={{
              padding: "24px",
              borderRadius: "8px",
              border: selectedTherapy === therapy.id ? "2px solid #CA0056" : "2px solid #e5e7eb",
              backgroundColor: selectedTherapy === therapy.id ? "#fff0f9ff" : "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                minWidth: "32px",
              }}
            >
              {selectedTherapy === therapy.id ? "✓" : therapy.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                className="font-semibold text-gray-900"
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {therapy.title}
              </h3>
              <p
                className="text-gray-600 text-sm"
                style={{
                  color: "#4b5563",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {therapy.description}
              </p>
            </div>
            {selectedTherapy === therapy.id && (
              <div
                className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#CA0056",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected confirmation message */}
      {selectedTherapy && (
        <div
          className="p-4 bg-teal-50 rounded-lg mb-8 flex items-center gap-3"
          style={{
            padding: "16px",
            backgroundColor: "#fff0f9ff",
            borderRadius: "8px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <CheckCircle
            size={20}
            style={{
              color: "#CA0056",
              minWidth: "20px",
            }}
          />
          <span
            style={{
              color: "#CA0056",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {therapyTypes.find((t) => t.id === selectedTherapy)?.title} Selected - You can proceed to select your
            package
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-8 border-t border-gray-200" style={{ gap: "12px", paddingTop: "32px" }}>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "1px solid #ca0056",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#CA0056",
            cursor: "pointer",
            backgroundColor: "#ffffff",
            transition: "background-color 0.2s ease",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTherapy}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            selectedTherapy ? "bg-gray-600 hover:bg-gray-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"
          }`}
          style={{
            flex: 1,
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: selectedTherapy ? "#ca0056" : "#d1d5db",
            cursor: selectedTherapy ? "pointer" : "not-allowed",
            border: "none",
            transition: "background-color 0.2s ease",
          }}
        >
          Continue to Packages
        </button>
      </div>
    </div>
  )
}

// Step 2: Select Package
const Step2_Package = ({ onNext, onBack, selectedPackage, setSelectedPackage }) => {
  const packages = [
    {
      id: "single",
      title: "Single Session",
      price: "₹999",
      description: "Perfect for a first-time session",
      popular: false,
      savings: null,
    },
    {
      id: "8sessions",
      title: "8 Sessions Package",
      price: "₹6000",
      description: "Best value for ongoing therapy",
      popular: true,
      savings: "25% OFF",
    },
    {
      id: "24sessions",
      title: "24 Sessions Package",
      price: "₹14400",
      description: "Maximum savings with commitment",
      popular: false,
      savings: "40% OFF",
    },
  ]

  return (
    <div className="p-8" style={{ padding: "32px" }}>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Select Package
        </h2>
        <p
          className="text-gray-600 text-sm mt-2"
          style={{
            color: "#4b5563",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          Step 2 of 4
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar currentStep={2} totalSteps={4} />
      </div>

      {/* Subtitle */}
      <p
        className="text-gray-600 text-center mb-8"
        style={{
          color: "#4b5563",
          textAlign: "center",
          marginBottom: "32px",
          fontSize: "15px",
        }}
      >
        Select the package that works best for your therapy journey
      </p>

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ gap: "24px", marginBottom: "32px" }}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all relative ${
              selectedPackage === pkg.id ? "border-teal-600 bg-teal-50" : "border-gray-200 hover:border-gray-300"
            }`}
            style={{
              padding: "24px",
              borderRadius: "8px",
              border: selectedPackage === pkg.id ? "2px solid #CA0056" : "2px solid #e5e7eb",
              backgroundColor: selectedPackage === pkg.id ? "#fff0f9ff" : "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
              textAlign: "center",
            }}
          >
            {pkg.popular && (
              <div
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <span
                  className="bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    backgroundColor: "#CA0056",
                    color: "#ffffff",
                    fontSize: "11px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  Most Popular
                </span>
              </div>
            )}

            <h3
              className="text-lg font-bold text-gray-900 mt-2"
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                marginTop: pkg.popular ? "8px" : "0",
              }}
            >
              {pkg.title}
            </h3>

            <p
              className="text-3xl font-bold text-teal-600 my-3"
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#CA0056",
                margin: "12px 0",
              }}
            >
              {pkg.price}
            </p>

            {pkg.savings && (
              <span
                className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold mb-3"
                style={{
                  backgroundColor: "#fce7f3",
                  color: "#9f1239",
                  fontSize: "11px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                {pkg.savings}
              </span>
            )}

            <p
              className="text-gray-600 text-sm"
              style={{
                color: "#4b5563",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              {pkg.description}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-8 border-t border-gray-200" style={{ gap: "12px", paddingTop: "32px" }}>
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "1px solid #ca0056",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ca0056",
            cursor: "pointer",
            backgroundColor: "#ffffff",
          }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedPackage}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            selectedPackage ? "bg-gray-600 hover:bg-gray-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed"
          }`}
          style={{
            flex: 1,
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: selectedPackage ? "#CA0056" : "#fce7f3",
            cursor: selectedPackage ? "pointer" : "not-allowed",
            border: "none",
          }}
        >
          Continue to Schedule
        </button>
      </div>
    </div>
  )
}

// Step 3: Select Date & Time
const Step3_DateTime = ({ onNext, onBack, selectedDate, setSelectedDate, selectedTime, setSelectedTime }) => {
  const timeSlots = ["07:00 PM – 08:00 PM", "08:00 PM – 09:00 PM", "09:00 PM – 10:00 PM"]

  return (
    <div className="p-8" style={{ padding: "32px" }}>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Select Date & Time
        </h2>
        <p
          className="text-gray-600 text-sm mt-2"
          style={{
            color: "#4b5563",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          Step 3 of 4
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar currentStep={3} totalSteps={4} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" style={{ gap: "32px", marginBottom: "32px" }}>
        {/* Date selection */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Select a Date
          </h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          />
          {selectedDate && (
            <p
              className="text-sm text-teal-600 mt-3 flex items-center gap-2"
              style={{
                fontSize: "13px",
                color: "#4b5563",
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Calendar size={16} />
              Selected: {new Date(selectedDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Time selection */}
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Available Time Slots
          </h3>
          {selectedDate ? (
            <div className="space-y-2" style={{ gap: "8px" }}>
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                    selectedTime === slot
                      ? "border-teal-600 bg-teal-50 text-teal-900"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: selectedTime === slot ? "2px solid #CA0056" : "2px solid #d1d5db",
                    backgroundColor: selectedTime === slot ? "#fff0f9ff" : "#ffffff",
                    color: selectedTime === slot ? "#ab145aff" : "#374151",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p
              className="text-gray-500 text-center py-8"
              style={{
                color: "#6b7280",
                textAlign: "center",
                padding: "32px 0",
                fontSize: "14px",
              }}
            >
              Select a date first to see available times
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-8 border-t border-gray-200" style={{ gap: "12px", paddingTop: "32px" }}>
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "1px solid #ca0056",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ca0056",
            cursor: "pointer",
            backgroundColor: "#ffffff",
          }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            selectedDate && selectedTime
              ? "bg-gray-600 hover:bg-gray-700 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          style={{
            flex: 1,
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: selectedDate && selectedTime ? "#ca0056" : "#d1d5db",
            cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
            border: "none",
          }}
        >
          Continue to Details
        </button>
      </div>
    </div>
  )
}

// Step 4: Personal Details
const Step4_PersonalDetails = ({ onBack, onSubmit, formData, setFormData }) => {
  const [agreed, setAgreed] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="p-8" style={{ padding: "32px" }}>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Personal Details
        </h2>
        <p
          className="text-gray-600 text-sm mt-2"
          style={{
            color: "#4b5563",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          Step 4 of 4
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar currentStep={4} totalSteps={4} />
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" style={{ gap: "24px", marginBottom: "32px" }}>
        {/* Full Name */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Full Name <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Mode of Therapy */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Mode of Therapy <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            name="therapyMode"
            value={formData.therapyMode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none appearance-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option value="">Select therapy mode</option>
            <option value="video">Video Call</option>
            <option value="phone">Phone Call</option>
            <option value="inperson">In Person</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Email <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Primary Issue */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Primary Issue/Concern <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            name="primaryConcern"
            value={formData.primaryConcern}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none appearance-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            //   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option value="">Select your primary concern</option>
            <option value="anxiety">Anxiety</option>
            <option value="depression">Depression</option>
            <option value="relationship">Relationship Issues</option>
            <option value="stress">Stress Management</option>
          </select>
        </div>

        {/* Phone Number */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Phone Number <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Session Type */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Session Type <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none appearance-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            //   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option value="">Select your session type</option>
            <option value="regular">Regular Therapy</option>
            <option value="crisis">Crisis Support</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>

        {/* Age */}
        <div>
          <label
            className="block text-sm font-semibold text-gray-900 mb-2"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Age <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter your age"
            // className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none"
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Terms and conditions checkbox */}
      <div
        className="flex items-start gap-3 mb-8 p-4 bg-gray-50 rounded-lg"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "32px",
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
        }}
      >
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
          style={{
            marginTop: "4px",
            cursor: "pointer",
            minWidth: "20px",
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm text-gray-700"
          style={{
            fontSize: "13px",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          I agree to the{" "}
          <a href="#" className="text-teal-600 underline hover:text-teal-700" style={{ color: "#CA0056" }}>
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-teal-600 underline hover:text-teal-700" style={{ color: "#CA0056" }}>
            Consent to Therapy
          </a>{" "}
          <span style={{ color: "#dc2626" }}>*</span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-8 border-t border-gray-200" style={{ gap: "12px", paddingTop: "32px" }}>
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "1px solid #ca0056",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ca0056",
            cursor: "pointer",
            backgroundColor: "#ffffff",
          }}
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!agreed || !formData.fullName || !formData.email || !formData.phone}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            agreed && formData.fullName && formData.email && formData.phone
              ? "bg-gray-600 hover:bg-gray-700 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          style={{
            flex: 1,
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: agreed && formData.fullName && formData.email && formData.phone ? "#ca0056" : "#d1d5db",
            cursor: agreed && formData.fullName && formData.email && formData.phone ? "pointer" : "not-allowed",
            border: "none",
          }}
        >
          Book Session
        </button>
      </div>
    </div>
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

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    console.log("Booking submitted:", {
      therapist: therapist?.name,
      therapyType: selectedTherapy,
      package: selectedPackage,
      date: selectedDate,
      time: selectedTime,
      personalDetails: formData,
    })
    // Reset and close
    setCurrentStep(1)
    setSelectedTherapy("")
    setSelectedPackage("")
    setSelectedDate("")
    setSelectedTime("")
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      age: "",
      therapyMode: "",
      primaryConcern: "",
      sessionType: "",
    })
    onClose()
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
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
    </ModalOverlay>
  )
}
