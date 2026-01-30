import { Box, Container, Typography, Paper, Stack, Divider, Chip } from '@mui/material';

const privacySections = [
  {
    id: 'definitions',
    title: 'Definitions',
    points: [
      'Company: PSYQ LEARNING AND TRAINING LLP operating as Psy-Q.',
      'User/You: any individual accessing or using the platform and services.',
      'Platform: Psy-Q websites, mobile apps, web links, and related digital channels.',
      'Professional: counsellors, psychologists, therapists, wellness advisors, doctors, or consultants authorized by Psy-Q.'
    ]
  },
  {
    id: 'nature-of-services',
    title: 'Nature of Services',
    points: [
      'Online counselling (video/audio/chat) and face-to-face consultations where available.',
      'Psychological self-assessments, screening tools, and wellness questionnaires.',
      'Workshops, webinars, training sessions, and self-help programs.',
      'Secure and encrypted messaging with Professionals and participation in feedback, reviews, or forums.'
    ]
  },
  {
    id: 'consent',
    title: 'Consent',
    points: [
      'Using the platform means you agree to collection, processing, storage, sharing, and transfer of your data as described.',
      'You may withdraw consent by emailing psyqonline@gmail.com; doing so may limit access to some services.',
      'Clinical consent is separately obtained before therapy begins.'
    ]
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    points: [
      'Identity details: name, age/date of birth, gender.',
      'Contact details: email, phone, emergency contact.',
      'Health and wellness information: history you provide, therapy concerns, assessment responses, and session notes.',
      'Payment and transaction information: confirmations, billing, and history.',
      'Technical and usage information: IP address, device/browser data, logs, cookies, and session activity.'
    ]
  },
  {
    id: 'collection-methods',
    title: 'How We Collect Your Information',
    points: [
      'Directly from you during registration, bookings, consultations, forms, messaging, or feedback.',
      'Automatically via cookies, analytics, and security monitoring.',
      'From trusted third parties such as payment gateways, platform vendors, or partner organizations.'
    ]
  },
  {
    id: 'purpose',
    title: 'Purpose of Data Collection',
    points: [
      'Provide, manage, and improve counselling and wellness services.',
      'Match you with Professionals and manage appointments, reminders, and follow-ups.',
      'Process payments, maintain records, ensure security, prevent fraud, and comply with legal or regulatory obligations.'
    ]
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality & Limits',
    points: [
      'Psy-Q and Professionals aim to keep counselling information confidential.',
      'Confidentiality may be broken to prevent serious harm, report abuse/neglect (especially involving minors), comply with court or lawful requests, or protect safety.'
    ]
  },
  {
    id: 'mandatory-reporting',
    title: 'Mandatory Reporting & Safety',
    points: [
      'Professionals may act if there is risk of self-harm, harm to others, child abuse, sexual abuse, domestic violence, or serious threats.',
      'Actions can include contacting emergency services, authorities, or your emergency contact.'
    ]
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing & Disclosure',
    points: [
      'No sale of personal information.',
      'Shared with Professionals involved in your care and vetted service providers (payments, cloud, video, support, security) under confidentiality obligations.',
      'Shared with law enforcement, courts, or regulators when legally required or for safety.'
    ]
  },
  {
    id: 'session-recording',
    title: 'Session Recording Policy',
    points: [
      'Users must not record sessions (audio/video/screen) without prior written consent from the Professional and Psy-Q.',
      'Unauthorized recording may result in session termination and account suspension/termination.'
    ]
  },
  {
    id: 'community-content',
    title: 'Community Content',
    points: [
      'Content posted publicly (reviews, forums, comments) may be visible to others.',
      'Avoid sharing sensitive personal information in public areas; Psy-Q is not responsible for information you share publicly.'
    ]
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking',
    points: [
      'Used for functionality, security, analytics, and performance insights.',
      'You can manage cookies in your browser; disabling them may limit features.'
    ]
  },
  {
    id: 'storage-transfers',
    title: 'Data Storage & Transfers',
    points: [
      'Data may be stored on secure servers in India or trusted cloud providers in other regions.',
      'Cross-border transfers use reasonable safeguards per applicable laws.'
    ]
  },
  {
    id: 'data-security',
    title: 'Data Security',
    points: [
      'Encryption, secure communication, restricted access, and monitoring to prevent unauthorized access.',
      'No system is fully secure; protect your credentials and devices.'
    ]
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    points: [
      'Kept only as long as needed to provide services, maintain records, meet legal obligations, or resolve disputes.',
      'Data is deleted or anonymized when no longer required where possible.'
    ]
  },
  {
    id: 'user-rights',
    title: 'Your Rights',
    points: [
      'Request access, correction, or deletion of your data (subject to law).',
      'Withdraw consent for processing or marketing where permitted.',
      'Request copies of records subject to clinical and legal constraints. Email psyqonline@gmail.com to exercise rights.'
    ]
  },
  {
    id: 'account-deletion',
    title: 'Account Deletion',
    points: [
      'Request deletion via psyqonline@gmail.com.',
      'Some information may be retained for legal compliance, dispute resolution, or fraud prevention; deletion may remove access to session history or assessments.'
    ]
  },
  {
    id: 'communications',
    title: 'Communication & Notifications',
    points: [
      'Contacts may occur via email, SMS, WhatsApp (if enabled), or in-app notifications for reminders and account updates.',
      'Marketing is sent only where permitted; you can opt out.'
    ]
  },
  {
    id: 'third-party-links',
    title: 'Third-Party Links',
    points: [
      'External sites have their own privacy practices; review them before sharing information.'
    ]
  },
  {
    id: 'data-breach',
    title: 'Data Breach',
    points: [
      'In case of a breach, Psy-Q will investigate, contain, and notify affected users where required by law.'
    ]
  },
  {
    id: 'policy-updates',
    title: 'Policy Updates',
    points: [
      'This policy may change; significant updates may be shared via email, platform notices, or website updates.',
      'Continued use after updates means you accept the revised policy.'
    ]
  },
  {
    id: 'legal-compliance',
    title: 'Legal Compliance',
    points: [
      'Intended to comply with applicable Indian laws including the Information Technology Act, 2000 and related data protection rules.'
    ]
  },
  {
    id: 'privacy-contact',
    title: 'Contact',
    points: [
      'Questions, complaints, or requests: psyqonline@gmail.com.',
      'Psy-Q is committed to confidentiality and safeguarding your information.'
    ]
  }
];

const termsSections = [
  {
    id: 'terms-definitions',
    title: 'Definitions',
    points: [
      'Company: PSYQ LEARNING AND TRAINING LLP operating as PSY-Q.',
      'User: any individual who accesses or uses the platform.',
      'Platform: PSY-Q website, mobile app, web links, and related digital services.',
      'Professional: therapist, psychologist, counsellor, wellness advisor, doctor, or consultant approved by PSY-Q.',
      'Services: counselling, assessments, workshops, learning materials, self-help tools, messaging, and related support.'
    ]
  },
  {
    id: 'terms-services',
    title: 'Nature of Services',
    points: [
      'Online (video/audio/chat) and face-to-face sessions where available.',
      'Assessments, screening tools, workshops, webinars, training, and self-help resources.',
      'Private messaging with Professionals and appointment notifications.'
    ]
  },
  {
    id: 'terms-acceptance',
    title: 'Acceptance of Terms',
    points: [
      'Using the platform forms a binding agreement; you must follow platform rules and applicable laws.',
      'If you disagree, stop using the platform.'
    ]
  },
  {
    id: 'terms-eligibility',
    title: 'Eligibility & Use by Minors',
    points: [
      'You must be 18+ and legally capable of contracting.',
      'Minors may use services only with valid parent/guardian consent; PSY-Q may refuse or terminate if consent is missing.'
    ]
  },
  {
    id: 'terms-account',
    title: 'Account Responsibility',
    points: [
      'Provide accurate information and keep it updated.',
      'Protect your credentials; you are responsible for activity under your account.',
      'Notify PSY-Q of suspected unauthorized access.'
    ]
  },
  {
    id: 'terms-teleconsultation',
    title: 'Teleconsultation Consent',
    points: [
      'You consent to receive services via video, audio, or messaging.',
      'Online sessions may have limits (reduced non-verbal cues, connectivity issues). Attend from a private, safe space.'
    ]
  },
  {
    id: 'terms-emergency',
    title: 'Not an Emergency Service',
    points: [
      'PSY-Q is not for emergencies. If at immediate risk (self-harm, harm to others, crisis), contact local emergency services or visit a hospital.'
    ]
  },
  {
    id: 'terms-medical',
    title: 'Medical Disclaimer',
    points: [
      'PSY-Q focuses on wellness support and counselling and typically does not provide diagnosis, emergency psychiatric care, or prescriptions unless explicitly stated and legally permitted.',
      'Outcomes vary per individual and circumstances.'
    ]
  },
  {
    id: 'terms-fees',
    title: 'Fees & Payments',
    points: [
      'Fees vary by Professional, session type, or duration; payment is required in advance to confirm bookings.',
      'Payments are processed via third-party gateways; their terms apply. Pricing may change and will be shown on the platform.'
    ]
  },
  {
    id: 'terms-appointments',
    title: 'Appointment Duration & Late Joining',
    points: [
      'Sessions run for the booked duration and end at the scheduled time.',
      'Professionals may wait only a limited window; missing that window can mark the session as missed and chargeable.'
    ]
  },
  {
    id: 'terms-cancellations',
    title: 'Cancellations, Rescheduling, Refunds',
    points: [
      'Follow the displayed cancellation window; late cancellations or missed sessions may be fully or partially charged.',
      'If a Professional or the platform reschedules, PSY-Q may offer a new slot or a refund.',
      'Refunds follow the Refund Policy timelines and may include processing times from banks or gateways.'
    ]
  },
  {
    id: 'terms-confidentiality',
    title: 'Confidentiality & Privacy',
    points: [
      'Information is handled under the Privacy Policy.',
      'Confidentiality can be broken for safety risks, abuse/violence (especially minors), or legal obligations.'
    ]
  },
  {
    id: 'terms-recording',
    title: 'Recording Policy',
    points: [
      'Recording sessions (screen/audio/video/photo) is prohibited without written consent from the Professional and PSY-Q.',
      'Violations may lead to termination, suspension, and legal action.'
    ]
  },
  {
    id: 'terms-messaging',
    title: 'Messaging Boundaries',
    points: [
      'Messaging is not emergency support; responses depend on Professional availability.',
      'Do not spam or pressure Professionals; they may refuse communication beyond professional boundaries.'
    ]
  },
  {
    id: 'terms-conduct',
    title: 'User Conduct',
    points: [
      'No harassment, threats, abuse, or hateful/illegal content.',
      'Do not misuse counselling for non-therapeutic purposes or violate others’ privacy.'
    ]
  },
  {
    id: 'terms-prohibited',
    title: 'Prohibited Activities',
    points: [
      'Do not copy/distribute platform content without permission.',
      'Do not hack, reverse engineer, disrupt, upload malware, impersonate, or attempt unauthorized access.'
    ]
  },
  {
    id: 'terms-ip',
    title: 'Intellectual Property',
    points: [
      'Platform content (text, graphics, logos, designs, software) is owned or licensed to PSY-Q; unauthorized use is prohibited.'
    ]
  },
  {
    id: 'terms-third-party',
    title: 'Third-Party Services',
    points: [
      'Includes payment processors, video tools, cloud, and analytics.',
      'PSY-Q is not responsible for third-party interruptions or privacy practices; use at your own risk.'
    ]
  },
  {
    id: 'terms-technical',
    title: 'Technical Limitations',
    points: [
      'Service may be disrupted by connectivity issues, device problems, third-party failures, maintenance, or downtime.',
      'PSY-Q may assist with rescheduling where possible.'
    ]
  },
  {
    id: 'terms-results',
    title: 'No Guarantee of Results',
    points: [
      'Counselling outcomes differ; no guarantees on specific results, recovery, or improvement within a set number of sessions.'
    ]
  },
  {
    id: 'terms-liability',
    title: 'Limitation of Liability',
    points: [
      'PSY-Q is not liable for indirect, incidental, special, or consequential damages, emotional distress, data loss, or third-party actions.',
      'Total liability is limited to the amount paid for the specific service giving rise to the claim.'
    ]
  },
  {
    id: 'terms-indemnity',
    title: 'Indemnification',
    points: [
      'You agree to indemnify PSY-Q, its team, and partners against claims arising from misuse of the platform, violation of terms, infringement of rights, or unlawful conduct.'
    ]
  },
  {
    id: 'terms-termination',
    title: 'Termination & Suspension',
    points: [
      'Accounts may be suspended or terminated for violations, harassment, misconduct, fraud, or misuse.',
      'Access ends immediately upon termination.'
    ]
  },
  {
    id: 'terms-force-majeure',
    title: 'Force Majeure',
    points: [
      'PSY-Q is not liable for delays due to events beyond control (natural disasters, government restrictions, outages, pandemics, war, civil unrest, or emergencies).'
    ]
  },
  {
    id: 'terms-law',
    title: 'Governing Law & Disputes',
    points: [
      'Governed by Indian law.',
      'Disputes are subject to arbitration under the Arbitration and Conciliation Act, 1996 with seat in India and language English.'
    ]
  },
  {
    id: 'terms-changes',
    title: 'Changes to Terms',
    points: [
      'Terms may be updated; significant changes may be notified by email or platform notices.',
      'Continued use means acceptance of updated terms.'
    ]
  },
  {
    id: 'terms-grievance',
    title: 'Grievance & Support',
    points: [
      'Contact psyqonline@gmail.com for queries, complaints, or support; responses follow reasonable timelines based on the issue.'
    ]
  }
];

const refundSections = [
  {
    id: 'refund-booking',
    title: 'Booking & Payment',
    points: [
      'Sessions must be booked in advance; payment confirms the time slot.',
      'Time slots are reserved exclusively once payment is made.'
    ]
  },
  {
    id: 'refund-cancellation',
    title: 'Cancellation & Rescheduling',
    points: [
      'Notify at least 24 hours before the session to receive either a full refund or a free reschedule to the next available slot.',
      'Cancellations within 24 hours are fully chargeable unless exceptional circumstances apply.'
    ]
  },
  {
    id: 'refund-no-show',
    title: 'No-Show Policy',
    points: [
      'If you do not attend without notice, the full session fee is charged and no refund is provided.'
    ]
  },
  {
    id: 'refund-late',
    title: 'Late Joining',
    points: [
      'Sessions end at the original time even if you join late.',
      'Arrivals more than 15 minutes late may be treated as a no-show.'
    ]
  },
  {
    id: 'refund-packages',
    title: 'Prepaid Packages',
    points: [
      'Refunds apply only to unused sessions.',
      'Completed sessions are charged at the regular individual rate; remaining amount is refunded.',
      'Packages must be used within the validity period; unused sessions after expiry may be non-refundable.'
    ]
  },
  {
    id: 'refund-workshops',
    title: 'Workshops / Group Sessions',
    points: [
      'Follow event-specific terms. Generally, refunds are allowed only within the stated pre-event window; once started, refunds may not be available.'
    ]
  },
  {
    id: 'refund-therapist',
    title: 'Therapist Cancellation / Rescheduling',
    points: [
      'If Psy-Q or the Professional cancels/reschedules, you receive either a full refund or priority rescheduling at the earliest available time.'
    ]
  },
  {
    id: 'refund-technical',
    title: 'Technical Issues',
    points: [
      'If client-side issues (internet/device) prevent attendance, the fee may not be refundable.',
      'If Psy-Q/therapist/platform issues occur, you may receive a free reschedule or full refund depending on the situation.'
    ]
  },
  {
    id: 'refund-recording',
    title: 'Recording & Privacy',
    points: [
      'Recording sessions without written consent is prohibited and may result in immediate termination of services.'
    ]
  },
  {
    id: 'refund-exceptional',
    title: 'Exceptional Circumstances',
    points: [
      'Medical emergencies or serious issues may be reviewed on a case-by-case basis at Psy-Q’s discretion.'
    ]
  },
  {
    id: 'refund-safety',
    title: 'Safety & Emergency Disclaimer',
    points: [
      'Psy-Q online counselling is not for emergencies (suicidal thoughts, self-harm, abuse, severe crises). Contact local emergency services or visit a hospital.'
    ]
  },
  {
    id: 'refund-therapist-change',
    title: 'Therapist Change Requests',
    points: [
      'You may request to change your therapist; Psy-Q will support reassignment based on availability.'
    ]
  },
  {
    id: 'refund-misconduct',
    title: 'Misconduct / Abuse',
    points: [
      'Abusive, threatening, or inappropriate behaviour can lead to immediate termination of services without refund.'
    ]
  },
  {
    id: 'refund-nonrefundable',
    title: 'Non-Refundable Situations',
    points: [
      'After a session is completed.',
      'Late cancellations within 24 hours (unless approved under exceptional circumstances).',
      'No-shows.',
      'Dissatisfaction with outcomes (therapy results vary and are not guaranteed).' 
    ]
  },
  {
    id: 'refund-timeline',
    title: 'Refund Processing',
    points: [
      'Approved refunds are processed within 7 working days to the original payment method.',
      'Bank or gateway timelines may vary.'
    ]
  },
  {
    id: 'refund-contact',
    title: 'Contact',
    points: [
      'To cancel, reschedule, or request a refund: +91 92070 10098 or psyqonline@gmail.com.'
    ]
  }
];

const misconductSections = [
  {
    id: 'misconduct-sexual',
    title: 'Sexual or Inappropriate Behaviour',
    points: [
      'Unwanted sexual comments, advances, lewd language, gestures, harassment, sexual roleplay, or inappropriate disclosure are strictly prohibited.',
      'Incidents may result in immediate termination and permanent banning without refunds.'
    ]
  },
  {
    id: 'misconduct-disrespect',
    title: 'Disrespectful or Boundary Violations',
    points: [
      'No verbal abuse, threats, aggressive language, coercion, gaslighting, or pressuring Professionals for contact outside the platform.',
      'Professionals may end sessions immediately; refunds will not be issued for misconduct.'
    ]
  },
  {
    id: 'misconduct-payment',
    title: 'Payment Fraud & Scam Activities',
    points: [
      'Chargeback fraud, fake payment proofs, stolen cards, or forcing extra sessions/bargaining after booking are prohibited.',
      'Cases may be reported to authorities and may lead to legal action.'
    ]
  },
  {
    id: 'misconduct-false-booking',
    title: 'False Booking & Platform Misuse',
    points: [
      'Use of fake identity, booking for harassment/data extraction, recording without consent, or impersonation can lead to blocking and forfeiture of payments.'
    ]
  },
  {
    id: 'misconduct-refunds',
    title: 'Refunds & Misconduct',
    points: [
      'No refunds if a session ends due to sexual misconduct, abuse, unsafe behaviour, misuse, or late arrival beyond the acceptable window.',
      'Refunds may be considered only if the issue is caused by PSY-Q or the Professional.'
    ]
  },
  {
    id: 'misconduct-reporting',
    title: 'Reporting & Investigation',
    points: [
      'Report misconduct to psyqonline@gmail.com.',
      'Reports are reviewed within 3–5 business days by an internal committee; confidentiality is maintained. Actions may include cancellation, suspension, banning, or legal steps.'
    ]
  },
  {
    id: 'misconduct-legal',
    title: 'Legal Enforcement',
    points: [
      'Policy is enforceable under the Information Technology Act (India) and other applicable laws related to digital fraud, harassment, and ethical practice.'
    ]
  }
];

const navItems = [
  { label: 'Privacy Policy', anchor: '#privacy', children: privacySections },
  { label: 'Terms & Conditions', anchor: '#terms', children: termsSections },
  { label: 'Refund & Cancellation', anchor: '#refunds', children: refundSections },
  { label: 'Scam, Fraud & Misconduct', anchor: '#misconduct', children: misconductSections },
  { label: 'FAQs', anchor: '#faqs' },
  { label: 'Contact Support', anchor: '#support-contact' }
];

const PolicyList = ({ items }) => (
  <Box component="ul" sx={{ pl: 3, m: 0 }}>
    {items.map((point, index) => (
      <Box component="li" key={index} sx={{ color: '#475569', lineHeight: 1.8, mb: 1, fontSize: '12px' }}>
        {point}
      </Box>
    ))}
  </Box>
);

const Policies = () => {
  return (
    <Box sx={{ bgcolor: '#f6f8fb' }}>
      <Box
        sx={{
          background: 'linear-gradient(120deg, #960050, #ca0056)',
          color: 'white',
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 10 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ letterSpacing: '0.15em', opacity: 0.9 }}>
            Updated January 2026
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 2 }}>
            Policies & Support
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.9, maxWidth: 760, mx: 'auto' }}>
            One place for privacy, terms, refunds, and conduct guidelines that govern how Psy-Q protects your data and delivers care.
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
            <Chip label="Privacy" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip label="Compliance" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip label="Trust" color="default" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, pb: { xs: 10, md: 14 } }}>
            <Paper
              id="privacy"
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                background: 'white',
                scrollMarginTop: '120px'
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px', color: "#ca0056" }}>
                Privacy Policy
              </Typography>
              <Typography sx={{ color: '#475569', mb: 3, fontSize: '12px' }}>
                How we collect, use, protect, and share personal information when you interact with Psy-Q.
              </Typography>

              <Stack spacing={3}>
                {privacySections.map((section) => (
                  <Box key={section.id} id={section.id} sx={{ scrollMarginTop: '120px' }}>
                    <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '14px' }}>
                      {section.title}
                    </Typography>
                    <PolicyList items={section.points} />
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              id="terms"
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', scrollMarginTop: '120px' }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px', color: "#ca0056" }}>
                Terms & Conditions
              </Typography>
              <Typography sx={{ color: '#475569', mb: 2, fontSize: '12px' }}>
                Rules for using Psy-Q services, platforms, and materials.
              </Typography>
              <Stack spacing={3}>
                {termsSections.map((section) => (
                  <Box key={section.id} id={section.id} sx={{ scrollMarginTop: '120px' }}>
                    <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '14px' }}>
                      {section.title}
                    </Typography>
                    <PolicyList items={section.points} />
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              id="refunds"
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', scrollMarginTop: '120px' }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px', color: "#ca0056" }}>
                Refund, Cancellation & Rescheduling
              </Typography>
              <Stack spacing={3}>
                {refundSections.map((section) => (
                  <Box key={section.id} id={section.id} sx={{ scrollMarginTop: '120px' }}>
                    <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '14px' }}>
                      {section.title}
                    </Typography>
                    <PolicyList items={section.points} />
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              id="misconduct"
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', scrollMarginTop: '120px' }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px', color: "#ca0056" }}>
                Scam, Fraud & Misconduct
              </Typography>
              <Stack spacing={3}>
                {misconductSections.map((section) => (
                  <Box key={section.id} id={section.id} sx={{ scrollMarginTop: '120px' }}>
                    <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '14px' }}>
                      {section.title}
                    </Typography>
                    <PolicyList items={section.points} />
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              id="faqs"
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', scrollMarginTop: '120px' }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '16px', color: "#ca0056" }}>
                Frequently Asked Questions
              </Typography>
              <Stack spacing={2.5}>
                {[{
                  q: 'Can I change my therapist?',
                  a: 'Yes. Request a change and we will reassign based on availability and your needs.'
                }, {
                  q: 'Is this service for emergencies?',
                  a: 'No. For crisis situations (self-harm, harm to others, severe distress), contact local emergency services immediately.'
                }, {
                  q: 'What is the refund window?',
                  a: 'Cancel at least 24 hours before your session for a full refund or free reschedule. Late cancellations and no-shows are chargeable.'
                }, {
                  q: 'How do I delete my account or update data preferences?',
                  a: 'Email psyqonline@gmail.com with your request. Some data may be retained where legally required.'
                }].map((item, index) => (
                  <Box key={index}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.q}</Typography>
                    <Typography sx={{ color: '#475569', mt: 0.5, lineHeight: 1.6 }}>{item.a}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              id="support-contact"
              elevation={0}
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #00388c, #005b96)', color: 'white', scrollMarginTop: '120px' }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                Need more help?
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 2 }}>
                We respond to most policy, privacy, and refund requests within 3–5 business days.
              </Typography>
              <Stack spacing={1}>
                <Typography>Email: psyqonline@gmail.com</Typography>
                <Typography>Phone: +91 92070 10098</Typography>
                <Typography>Hours: Monday to Friday, 9:00 AM – 6:00 PM IST</Typography>
              </Stack>
            </Paper>
      </Container>
    </Box>
  );
};

export default Policies;
