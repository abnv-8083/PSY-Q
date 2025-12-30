"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import BookingModal from "/Users/fee/Desktop/psyq/src/components/booking-modal.jsx"

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


  const therapists = [
    {
      id: 1,
      name: "Suhail VH",
      title: "Consultant psychologist",
      credentials: "BSc · MA",
      additionalInfo: "+1 more",
      languages: "Malayalam, English",
      specializations: ["Family & Relationship Counselling", "Career Guidance"],
      image: "/images/faculty/suhail.jpeg",
    },
    {
      id: 2,
      name: "Kallu Sajeev",
      title: "Corporate Wellbeing coach & Consultant Psychologist",
      credentials: "MA · PGDRP",
      additionalInfo: "",
      languages: "Malayalam, English",
      specializations: ["Relationship issues" , "anger and stress management" , "corporate mentalWellness" ,  "Occupational Well-being"],
      image: "images/faculty/kallu.jpeg",
    },
    {
      id: 3,
      name: "Nasif Ahmed",
      title: "Consultant Psychologist",
      credentials: "BA · MA",
      additionalInfo: "",
      languages: "Malayalam, English",
      specializations: ["Family", "Relationship Difficulties"],
      image: "/images/faculty/nasif.jpeg",
    },
    {
      id: 4,
      name: "Parvathi K",
      title: "Sports Psychologist",
      credentials: "BSc Sports psychology",
      additionalInfo: "",
      languages: "Malayalam, English",
      specializations: ["Training", "Educational & Sports Counselling"],
      image: "/images/faculty/parvathi.jpeg",
    },
    {
      id: 5,
      name: "Nafih PK",
      title: "Sports Psychologist",
      credentials: "BA · MA",
      additionalInfo: "",
      languages: "Malayalam, English",
      specializations: ["Team Sports", "esports", "Athletics"],
      image: "/images/faculty/nafih.jpeg",
    },
    // {
    //   id: 6,
    //   name: "Junaid Rafeeq",
    //   title: "Consultant Psychologist",
    //   credentials: "BA · MA",
    //   additionalInfo: "",
    //   languages: "Malayalam, English",
    //   specializations: ["Relationship Difficulties", "Behavioral Issues", "Mental Health Support"],
    //   image: "/male-therapist-professional-headshot.jpg",
    // },
    // {
    //   id: 7,
    //   name: "Murshid Puthur",
    //   title: "Psychologist & Trainer (RCI Licensed)",
    //   credentials: "BSc · MA",
    //   additionalInfo: "+1 more",
    //   languages: "Malayalam, English",
    //   specializations: ["Training", "Educational & Academic Counselling"],
    //   image: "/male-therapist-professional-headshot.jpg",
    // },
    // {
    //   id: 8,
    //   name: "Shibina Azeez",
    //   title: "Child Rehabilitation Psychologist (RCI Licensed)",
    //   credentials: "MA · PGDRP",
    //   additionalInfo: "",
    //   languages: "Malayalam, English",
    //   specializations: ["Child Rehabilitation Services", "Behavior Therapy"],
    //   image: "/female-therapist-wearing-hijab-professional.jpg",
    // },
    // {
    //   id: 9,
    //   name: "Junaid Rafeeq",
    //   title: "Consultant Psychologist",
    //   credentials: "BA · MA",
    //   additionalInfo: "",
    //   languages: "Malayalam, English",
    //   specializations: ["Relationship Difficulties", "Behavioral Issues"],
    //   image: "/male-therapist-professional-headshot.jpg",
    // },
  ]

  // Filter therapists based on search query
  const filteredTherapists = therapists.filter(
    (therapist) =>
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div
      className="min-h-screen bg-gray-50 py-32 px-56"
      style={{
        backgroundColor: "#f9fafb",
        margin: '56px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Search bar section */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-full max-w-2xl">
            {/* Search input with icon */}
            <div className="relative">
              <Search
                className="absolutetransform -translate-y-1/2 text-gray-400 w-5 h-5"
                style={{
                  color: "#9ca3af",
                  position: "absolute",
                  top: "16px",
                  left: "14px",
                }}
              />
              <input
                type="text"
                placeholder="Search therapist name or service"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-700"
                style={{
                  fontSize: "15px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  paddingLeft: "48px",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            display: "grid",
            gap: "24px",
          }}
        >
          {filteredTherapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px 0 0 12px",
                transition: "box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "row",
                height: "280px",
              }}
            >
              <div
                className="rounded-l-xl overflow-hidden bg-gray-200 flex-shrink-0"
                style={{
                  width: "25%",
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
                  className="w-full h-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.backgroundColor = "#e5e7eb"
                  }}
                />
              </div>

              <div
                className="p-4 flex flex-col gap-2 flex-1 overflow-hidden"
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
                <div>
                  {/* Name - dark blue color to match screenshot */}
                  <h3
                    className="text-sm font-bold text-blue-900 leading-tight"
                    style={{
                      color: "#1e3a8a",
                      fontSize: "14px",
                      fontWeight: "700",
                      lineHeight: "1.2",
                    }}
                  >
                    {therapist.name}
                  </h3>

                  {/* Title */}
                  <p
                    className="text-xs font-semibold text-gray-600 leading-tight mt-1"
                    style={{
                      color: "#4b5563",
                      fontSize: "11px",
                      fontWeight: "600",
                      marginTop: "2px",
                      lineHeight: "1.2",
                    }}
                  >
                    {therapist.title}
                  </p>

                  {/* Credentials row */}
                  <div
                    className="flex items-center gap-1 mt-1 text-xs text-gray-500"
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    <span>{therapist.credentials}</span>
                    {therapist.additionalInfo && <span>{therapist.additionalInfo}</span>}
                  </div>

                  {/* Languages row */}
                  <p
                    className="text-xs italic text-gray-500 mt-1"
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginTop: "2px",
                      fontStyle: "italic",
                    }}
                  >
                    Speaks: {therapist.languages}
                  </p>
                </div>

                {/* Specialization tags/pills - light pink background */}
                <div
                  className="flex flex-wrap gap-1"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  {therapist.specializations.slice(0, 5).map((spec, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-pink-100 text-gray-700 font-medium whitespace-nowrap"
                      style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "16px",
                        backgroundColor: "#fce7f3",
                        color: "#374151",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                {/* <p
                  className="text-xs text-gray-600 font-medium"
                  style={{
                    fontSize: "11px",
                    color: "#4b5563",
                    fontWeight: "600",
                  }}
                >
                  {therapist.price}
                </p> */}

                {/* Action buttons */}
                <div
                  className="flex gap-2 mt-auto"
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={() => setBookingTherapist(therapist)}
                    className="flex-1 bg-green-700 text-white py-2 px-2 rounded-lg font-semibold text-xs hover:bg-green-800 transition-colors"
                    style={{
                      flex: 1,
                      backgroundColor: "#CA0056",
                      color: "#ffffff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      transition: "background-color 0.2s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#ff006fff")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#CA0056")}
                  >
                    Book now
                  </button>
                  <button
                    // onClick={() => setBookingTherapist(therapist)}
                    className="flex-1 bg-green-700 text-white py-2 px-2 rounded-lg font-semibold text-xs hover:bg-green-800 transition-colors flex items-center justify-center gap-1"
                    style={{
                      flex: 1,
                      backgroundColor: "#CA0056",
                      color: "#ffffff",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "background-color 0.2s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#ff006fff")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#CA0056")}
                  >
                    ⓘ About
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredTherapists.length === 0 && (
          <div
            className="text-center py-12"
            style={{
              textAlign: "center",
              padding: "48px 0",
            }}
          >
            <p
              className="text-gray-500 text-lg"
              style={{
                color: "#6b7280",
                fontSize: "18px",
              }}
            >
              No therapists found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Booking modal */}
      <BookingModal
        isOpen={!!bookingTherapist}
        therapist={bookingTherapist}
        onClose={() => setBookingTherapist(null)}
      />
    </div>
  )
}
