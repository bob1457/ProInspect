import { PersonalInfo, CredentialItem, InspectionItem, FAQItem } from './types';

export const initialProfile: PersonalInfo = {
  fullName: 'Marcus Thompson',
  email: 'm.thompson@proinspect.com',
  phone: '+1 (555) 923-4410',
  timezone: 'Central Standard Time (CST)',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAbo2K_N_Ec9ACPbwE3mhSiczHJ-PbLOLj7N8ofTbVJesncyYu0cZuImuj3f1clu6Xyo-LWwUD_WOuLF1BxNvsNdPOS-4viE8LbpjT0zC3d_w_ojX1L72O7HjTS_Npz72QrlgBTdtG3Sl3XqWTdDUS2rb9B0Fbnr-oG6VMUEykZ-T0Mu1hdHr7p_7_z8Ij-pwuGDWp72kx73sELA0X8mnsSH77V8eCpFchbjNcRbtkzGjKpV-wGFTaZ2NpvBoAk8G1yYJ60CZ78No',
};

export const initialCredentials: CredentialItem[] = [
  {
    id: 'cred-1',
    type: 'TREC Property Inspector',
    licenseId: 'TX-98234-A',
    expiryDate: 'Dec 15, 2025',
    status: 'ACTIVE',
  },
  {
    id: 'cred-2',
    type: 'Lead-Based Paint Certification',
    licenseId: 'LBP-11029',
    expiryDate: 'Jan 20, 2024',
    status: 'EXPIRING SOON',
  },
  {
    id: 'cred-3',
    type: 'WDI/Termite Technician',
    licenseId: 'WDI-4458',
    expiryDate: 'May 12, 2026',
    status: 'ACTIVE',
  },
];

export const initialInspections: InspectionItem[] = [
  {
    id: 'insp-1',
    propertyName: 'Oakwood Luxury Apartments',
    address: '402 Oakwood Dr, Suite 100, Austin, TX',
    date: 'Jun 25, 2026',
    inspectorName: 'Marcus Thompson',
    status: 'COMPLETED',
    score: 94,
    type: 'Full Structural',
    clientName: 'Sarah Jenkins (Oakwood Property Management)',
    photos: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'
    ],
    subtasks: [
      { id: 'sub-1-1', title: 'Verify load-bearing walls integrity', completed: true },
      { id: 'sub-1-2', title: 'Assess foundation alignment & cracks', completed: true },
      { id: 'sub-1-3', title: 'Inspect roof truss & support columns', completed: true },
      { id: 'sub-1-4', title: 'Test structural concrete moisture levels', completed: true }
    ],
    voiceNotes: [
      {
        id: 'vn-1-1',
        transcript: 'Completed primary structural evaluation of Oakwood Luxury Apartments. No significant foundation cracking found. Roof trusses look secure, but minor shingle wear was noted on the southern side.',
        createdAt: '2026-06-25T14:30:00Z',
        duration: 24
      }
    ]
  },
  {
    id: 'insp-2',
    propertyName: 'Westside Commercial Plaza',
    address: '1090 Westside Blvd, Building B, Austin, TX',
    date: 'Jun 28, 2026',
    inspectorName: 'Marcus Thompson',
    status: 'IN_PROGRESS',
    type: 'WDI / Termite',
    clientName: 'David Miller (Westside Commerce Ltd)',
    photos: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    ],
    subtasks: [
      { id: 'sub-2-1', title: 'Check perimeter soil and mulch beds', completed: true },
      { id: 'sub-2-2', title: 'Probe sub-floor wood frames & joists', completed: true },
      { id: 'sub-2-3', title: 'Inspect wall voids near plumbing penetrations', completed: false },
      { id: 'sub-2-4', title: 'Set up moisture monitoring sensors', completed: false }
    ],
    voiceNotes: [
      {
        id: 'vn-2-1',
        transcript: 'Checked sub-floor joists under kitchen area. High moisture readings detected around the main sink drain stack. Recommend termite moisture barriers.',
        createdAt: '2026-06-28T10:15:00Z',
        duration: 18
      }
    ]
  },
  {
    id: 'insp-3',
    propertyName: 'Summit Ridge Residential Complex',
    address: '8910 Summit Ridge Rd, Austin, TX',
    date: 'Jul 02, 2026',
    inspectorName: 'Marcus Thompson',
    status: 'SCHEDULED',
    type: 'Lead-Based Paint',
    clientName: 'Elena Rostova (Summit Ridge HOA)',
    photos: [],
    subtasks: [
      { id: 'sub-3-1', title: 'Calibrate XRF analyzer gun', completed: false },
      { id: 'sub-3-2', title: 'Take core paint samples from window sills', completed: false },
      { id: 'sub-3-3', title: 'Test kitchen trim and cabinet finishes', completed: false },
      { id: 'sub-3-4', title: 'Assess exterior door frame paint layers', completed: false }
    ]
  },
];

export const faqs: FAQItem[] = [
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time through your dashboard. Changes to pricing will be reflected in your next billing cycle.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Absolutely. We offer a 14-day full-featured trial for our Team plan. No credit card is required to get started and test out our utility-focused inspection tools.',
  },
  {
    question: 'How does the storage limit work?',
    answer: 'Storage refers to the total file size of photos and documents uploaded across all inspections. 1GB typically covers hundreds of high-resolution property photos.',
  },
  {
    question: 'Do you offer discounts for non-profits?',
    answer: 'Yes, we support housing charities and non-profit organizations. Please contact our support team with your documentation to receive a 30% discount on any annual plan.',
  },
];

export const comparisonFeatures = [
  { name: 'Monthly Reports', solo: '10', team: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Photo Evidence', solo: 'Basic', team: 'Advanced Markup', enterprise: 'Pro Editing Toolset' },
  { name: 'Team Members', solo: '1', team: 'Up to 5', enterprise: 'Custom' },
  { name: 'Integrations', solo: '—', team: 'Basic CRM', enterprise: 'Full API / Zapier' },
  { name: 'Support', solo: 'Email', team: 'Priority Email', enterprise: '24/7 Dedicated Support' },
];
