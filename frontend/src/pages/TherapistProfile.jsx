import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getTherapistById } from "../data/therapists"
import BookingModal from "../components/BookingModal.jsx"

function ReasonRow({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0f766e", display: "inline-block" }} />
        <span style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>{label}</span>
      </div>
      <span style={{ color: "#4b5563", fontWeight: 600, fontSize: 14 }}>{value}%</span>
    </div>
  )
}

function ActivityBar({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            height: 18,
            width: `${Math.max(value, 6)}%`,
            maxWidth: 260,
            backgroundColor: color,
            borderRadius: 12,
          }}
        />
        <span style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>{value}%</span>
      </div>
      <span style={{ color: "#4b5563", fontWeight: 600, fontSize: 12 }}>{label}</span>
    </div>
  )
}

export default function TherapistProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const therapist = useMemo(() => getTherapistById(id), [id])
  const [selectedTime, setSelectedTime] = useState("11:00 AM")
  const [bookingTherapist, setBookingTherapist] = useState(null)

  if (!therapist) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#111827", fontWeight: 600 }}>Therapist not found.</p>
        <Link to="/therapists" style={{ color: "#ca0056", fontWeight: 700 }}>Back to therapists</Link>
      </div>
    )
  }

  const morningSlots = ["9:00 AM", "10:00 AM", "11:00 AM"]
  const daySlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"]

  const handleBook = () => {
    setBookingTherapist(therapist)
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .therapist-grid {
            grid-template-columns: 1fr !important;
          }
          .therapist-container {
            padding: 24px 12px 32px !important;
          }
          .therapist-card {
            padding: 16px !important;
          }
          .therapist-name {
            font-size: 22px !important;
          }
          .section-title {
            font-size: 16px !important;
          }
          .calendar-grid {
            gap: 4px !important;
          }
          .time-slot {
            min-width: 70px !important;
            font-size: 11px !important;
            padding: 8px 10px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .therapist-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .booking-section {
            grid-column: 1 / -1 !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
      <div
        className="therapist-container"
        style={{
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          padding: "48px 16px 64px",
        }}
      >
        <div className="therapist-grid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr 0.9fr", gap: 24 }}>
        {/* Left column: photo + contact */}
        <div className="therapist-card" style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 18,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          >
            <img
              src={therapist.image}
              alt={therapist.name}
              style={{ width: "100%", display: "block", aspectRatio: "4/5", objectFit: "cover" }}
            />
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, color: "#1f2937", fontWeight: 600, fontSize: 14 }}>
            <li>📍 {therapist.location || "Location available on request"}</li>
            <li>📞 {therapist.phone || "Contact available on request"}</li>
            <li>✉️ {therapist.email || "Email available on request"}</li>
          </ul>
          <div style={{ marginTop: 14 }}>
            <p style={{ color: "#111827", fontWeight: 700, marginBottom: 6, fontSize: 14 }}>Languages</p>
            <ul style={{ listStyle: "disc", paddingLeft: 18, color: "#4b5563", fontWeight: 600, display: "grid", gap: 4, fontSize: 14 }}>
              {(therapist.languages || []).map((lang) => (
                <li key={lang}>{lang}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle column: details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="therapist-card" style={{ background: "white", borderRadius: 18, padding: "20px 22px", boxShadow: "0 12px 30px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "#6b7280", fontWeight: 700, letterSpacing: "0.05em", fontSize: 12 }}>COUNSELLING THERAPY AND WELLNESS</p>
            <h1 className="therapist-name" style={{ color: "#0f172a", fontSize: 28, margin: "4px 0 6px", fontWeight: 800 }}>{therapist.name}</h1>
            <p style={{ color: "#4b5563", fontWeight: 600, marginBottom: 14, fontSize: 15 }}>{therapist.title}</p>

            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              }}
            >
              {therapist.aiSummary.split('\n\n').map((paragraph, index) => (
                <p key={index} style={{ color: "#4b5563", fontWeight: 600, lineHeight: 1.7, fontSize: 14, marginBottom: index < therapist.aiSummary.split('\n\n').length - 1 ? '12px' : 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="therapist-card" style={{ background: "white", borderRadius: 18, padding: "20px 22px", boxShadow: "0 12px 30px rgba(0,0,0,0.05)", display: "grid", gap: 16 }}>
            {/* <h3 style={{ color: "#0f172a", fontSize: 18, fontWeight: 800, margin: 0 }}>Top Patient Visit Reasons</h3> */}
            {/* <div>
              {(therapist.visitReasons || []).map((reason) => (
                <ReasonRow key={reason.label} label={reason.label} value={reason.value} />
              ))}
            </div> */}
            <h3 className="section-title" style={{ color: "#0f172a", fontSize: 18, fontWeight: 800, margin: 0 }}>Professional Activities</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {(therapist.activities || []).map((activity) => (
                <ActivityBar key={activity.label} label={activity.label} value={activity.value} color={activity.color} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: booking */}
        <div
          style={{
            background: "#f8dfe9ff",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h3 style={{ color: "#000", fontSize: 20, fontWeight: 800, margin: 0 }}>Book an Appointment</h3>
          <div>
            <p style={{ color: "#000", fontWeight: 700, marginBottom: 8 }}>June</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {[22, 23, 24, 25, 26, 27, 28].map((day) => (
                <div
                  key={day}
                  style={{
                    padding: "10px 0",
                    textAlign: "center",
                    borderRadius: 10,
                    background: day === 25 || day === 26 ? "#00388C" : "white",
                    color: day === 25 || day === 26 ? "white" : "#111827",
                    fontWeight: 700,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "#000", fontWeight: 700, marginBottom: 8 }}>Time</p>
            <p style={{ color: "#141414", fontWeight: 700, margin: "0 0 6px" }}>Morning</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {morningSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    minWidth: 82,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #00388c",
                    backgroundColor: selectedTime === slot ? "#00388C" : "white",
                    color: selectedTime === slot ? "white" : "#111827",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p style={{ color: "#141414", fontWeight: 700, margin: "0 0 6px" }}>Day</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {daySlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  style={{
                    minWidth: 82,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    backgroundColor: selectedTime === slot ? "#00388C" : "white",
                    color: selectedTime === slot ? "white" : "#111827",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBook}
            style={{
              width: "100%",
              backgroundColor: "#ca0056",
              color: "#ffffff",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(225,225,255,0.08)",
              marginTop: "auto",
            }}
          >
            Book Now
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "#00388C",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #00388C",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={!!bookingTherapist}
        therapist={bookingTherapist}
        onClose={() => setBookingTherapist(null)}
      />
      </div>
    </>
  )
}
