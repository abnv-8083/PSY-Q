"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import BookingModal from "../components/BookingModal.jsx"
import { therapists } from "../data/therapists"

// BookingModal component for displaying booking form
const OldBookingModal = ({ isOpen, therapist, onClose }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  if (!isOpen || !therapist) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Booking request:", { name, email, therapist: therapist.name })
    setName("")
    setEmail("")
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Modal card container */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-8 relative"
        style={{
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-900 font-light"
          style={{
            cursor: "pointer",
            transition: "color 0.2s ease",
          }}
        >
          ×
        </button>

        {/* Modal title with therapist name */}
        <h2
          className="text-xl font-bold text-gray-900 mb-6"
          style={{
            color: "#111827",
          }}
        >
          Book a Session with {therapist.name}
        </h2>

        {/* Booking form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              placeholder="Your Name"
              style={{
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none transition"
              placeholder="Email Address"
              style={{
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
            style={{
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Book Session
          </button>
        </form>
      </div>
    </div>
  )
}

// Main Therapists component
export default function Therapists() {
  const [searchQuery, setSearchQuery] = useState("")
  const [bookingTherapist, setBookingTherapist] = useState(null)

  // Filter therapists based on search query
  const filteredTherapists = therapists.filter(
    (therapist) =>
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .mobile-card {
            min-height: 160px !important;
          }
          .mobile-image {
            min-height: 160px !important;
            width: 35% !important;
          }
          .mobile-content {
            padding: 8px !important;
            gap: 3px !important;
          }
          .mobile-name {
            font-size: 16px !important;
            line-height: 1.1 !important;
          }
          .mobile-title {
            font-size: 9px !important;
            margin-top: 1px !important;
          }
          .mobile-credentials {
            font-size: 8px !important;
            margin-top: 2px !important;
          }
          .mobile-languages {
            font-size: 8px !important;
            margin-top: 1px !important;
          }
          .mobile-spec-tag {
            font-size: 7px !important;
            padding: 1px 4px !important;
          }
          .mobile-price {
            font-size: 13px !important;
            margin-top: 2px !important;
          }
          .mobile-button {
            font-size: 8px !important;
            padding: 4px 6px !important;
          }
          .mobile-grid {
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)) !important;
          }
        }
      `}</style>
      <div
        className="min-h-screen bg-gray-50"
        style={{
          backgroundColor: "#f9fafb",
          paddingTop: "var(--space-10)",
          paddingBottom: "var(--space-5)",
          paddingLeft: "var(--space-2)",
          paddingRight: "var(--space-2)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Search bar section */}
          <div style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "672px" }}>
            {/* Search input with icon */}
            <div style={{ position: "relative" }}>
              <Search
                size={20}
                style={{
                  color: "#9ca3af",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: "16px",
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                placeholder="Search therapist name or service"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "var(--space-6)",
                  paddingRight: "var(--space-3)",
                  paddingTop: "var(--space-2)",
                  paddingBottom: "var(--space-2)",
                  borderRadius: "9999px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="mobile-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {filteredTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="mobile-card"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                transition: "box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "row",
                minHeight: "120px",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)"}
            >
              <div
                className="mobile-image"
                style={{
                  width: "50%",
                  minWidth: "150px",
                  height: "100%",
                  borderRadius: "12px 0 0 12px",
                  backgroundColor: "#e5e7eb",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={therapist.image || "/placeholder.svg"}
                  alt={therapist.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "120px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb"
                  }}
                />
              </div>

              <div
                className="mobile-content"
                style={{
                  padding: "16px",
                  gap: "8px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {/* Therapist info section */}
                <div style={{ minHeight: 0 }}>
                  <h3
                    className="text-sm font-bold text-blue-900 leading-tight mobile-name"
                    style={{
                      color: "#1e3a8a",
                      fontSize: "18px",
                      fontWeight: "700",
                      lineHeight: "1.2",
                    }}
                  >
                    {therapist.name}
                  </h3>

                  {/* Title */}
                  <p
                    className="text-xs font-semibold text-gray-600 leading-tight mt-1 mobile-title"
                    style={{
                      color: "#4b5563",
                      fontSize: "11px",
                      fontWeight: "600",
                      marginTop: "8px",
                      lineHeight: "1.2",
                    }}
                  >
                    {therapist.title}
                  </p>

                  {/* Credentials row */}
                  <div
                    className="flex items-center gap-1 mt-1 text-xs text-gray-500 font-bold mobile-credentials"
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginTop: "8px",
                      fontSize: "10px",
                      color: "#ca0056",
                    }}
                  >
                    <span>{therapist.credentials}</span>
                    {therapist.additionalInfo && <span>{therapist.additionalInfo}</span>}
                  </div>

                  {/* Languages row */}
                  <p
                    className="text-xs italic text-gray-500 mt-1 font-medium mobile-languages"
                    style={{
                      fontSize: "10px",
                      color: "#6b7280",
                      marginTop: "8px",
                      fontStyle: "italic",
                    }}
                  >
                    {Array.isArray(therapist.languages) ? therapist.languages.join(", ") : therapist.languages}
                  </p>
                </div>

                {/* Specialization tags/pills - light pink background */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "8px",
                    minHeight: 0,
                  }}
                >
                  {therapist.specializations.slice(0, 4).map((spec, index) => (
                    <span
                      key={index}
                      className="mobile-spec-tag"
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        backgroundColor: "#fce7f3",
                        color: "#374151",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Next available slot - green text */}
                {/* <p
                  className="text-xs text-green-600 font-medium mt-1"
                  style={{
                    fontSize: "11px",
                    color: "#16a34a",
                    fontWeight: "600",
                    marginTop: "3px",
                  }}
                >
                  NEXT SLOT: {therapist.nextSlot}
                </p> */}

                {/* Price */}
                <p mobile-price
                  className="text-xs text-gray-600 font-bold"
                  style={{
                    fontSize: "18px",
                    color: "#ca0056",
                    fontWeight: "600",
  
                  }}
                >
                  {therapist.price}
                </p>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-1)",
                    marginTop: "auto",
                    paddingTop: "var(--space-1)",
                  }}
                >
                  <button
                    className="mobile-button"
                    onClick={() => setBookingTherapist(therapist)}
                    style={{
                      flex: 1,
                      backgroundColor: "#CA0056",
                      color: "#ffffff",
                      padding: "var(--space-1) var(--space-2)",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      transition: "background-color 0.2s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      whiteSpace: "nowrap",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#ff006f")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#CA0056")}
                  >
                    Book now
                  </button>
                  <Link
                    to={`/therapists/${therapist.id}`}
                    style={{ flex: 1, textDecoration: "none" }}
                  >
                    <button
                      className="mobile-button"
                      style={{
                        width: "100%",
                        backgroundColor: "#CA0056",
                        color: "#ffffff",
                        padding: "var(--space-1) var(--space-2)",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "3px",
                        transition: "background-color 0.2s ease",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        whiteSpace: "nowrap",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#ff006f")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#CA0056")}
                    >
                      About
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredTherapists.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              No therapists found matching your search.
            </p>
          </div>
        )}
        {/* Booking modal */}
        <BookingModal
          open={!!bookingTherapist}
          packageDetails={bookingTherapist}
          onClose={() => setBookingTherapist(null)}
        />
      </div>
    </div>
      </>
  )
}
