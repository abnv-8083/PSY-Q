import { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What services does Psy-Q offer?",
      answer: "Psy-Q offers comprehensive support including competitive exam preparation, psychological career webinars, and online counseling services."
    },
    {
      question: "How can I get started with Psy-Q?",
      answer: "You can get started by signing up for our services through our website or contacting our support team for personalized guidance."
    },
    {
      question: "Are the counseling sessions confidential?",
      answer: "Yes, all counseling sessions are completely confidential and conducted in a safe, supportive environment."
    },
    {
      question: "Do you offer group sessions or only individual counseling?",
      answer: "We offer both individual and group counseling sessions, as well as webinars that can accommodate multiple participants."
    },
    {
      question: "What makes Psy-Q different from other counseling services?",
      answer: "Psy-Q specializes in combining psychological insights with competitive exam preparation, providing a unique holistic approach to student success."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="bg-gray-50"
      style={{
        backgroundColor: '#f9fafb',
        padding: 'var(--space-8) 0',
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div 
          className="text-center space-y-6 lg:space-y-8 mb-12 lg:mb-16"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
          }}
        >
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            Frequently Asked Questions
          </h2>
          <p 
            className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
            style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '48rem',
              margin: '0 auto',
              lineHeight: '1.75',
            }}
          >
            Find answers to common questions about our services and approach.
          </p>
        </div>
        
        <div 
          className="max-w-4xl mx-auto space-y-6"
          style={{
            maxWidth: '56rem',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                // boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f3f4f6',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: openIndex === index ? '#f9fafb' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <span 
                  className="text-base font-semibold text-gray-900 pr-4"
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    paddingRight: 'var(--space-2)',
                  }}
                >{faq.question}</span>
                <div 
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${openIndex === index ? 'bg-pink-100 rotate-180' : 'bg-gray-100'}`}
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: openIndex === index ? '#fce7f3' : '#f3f4f6',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${openIndex === index ? 'text-pink-600' : 'text-gray-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div 
                  className="px-8 pb-6 border-t border-gray-100"
                  style={{
                    padding: '0 var(--space-4) var(--space-3)',
                    borderTop: '1px solid #f3f4f6',
                  }}
                >
                  <p 
                    className="text-gray-600 leading-relaxed pt-4"
                    style={{
                      color: '#6b7280',
                      lineHeight: '1.75',
                      paddingTop: 'var(--space-2)',
                      fontSize: '14px',
                    }}
                  >{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;