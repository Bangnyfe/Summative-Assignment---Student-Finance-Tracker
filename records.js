// Seed records for Student Finance Tracker
// Exposes a global SEED_RECORDS array that functionality.js will use if localStorage has no records.
const SEED_RECORDS = [
  {
    id: 'rec_1',
    description: 'Campus registration fee',
    amount: 25000.0,
    category: 'Fees',
    date: '2025-09-01',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z'
  },
  {
    id: 'rec_2',
    description: 'Textbooks',
    amount: 12000.5,
    category: 'Books',
    date: '2025-09-05',
    createdAt: '2025-09-05T10:30:00.000Z',
    updatedAt: '2025-09-05T10:30:00.000Z'
  },
  {
    id: 'rec_3',
    description: 'Bus pass',
    amount: 3000.0,
    category: 'Transport',
    date: '2025-09-07',
    createdAt: '2025-09-07T07:20:00.000Z',
    updatedAt: '2025-09-07T07:20:00.000Z'
  },
  {
    id: 'rec_4',
    description: 'Lunch',
    amount: 450.75,
    category: 'Food',
    date: '2025-09-08',
    createdAt: '2025-09-08T12:15:00.000Z',
    updatedAt: '2025-09-08T12:15:00.000Z'
  }
];

if (typeof window !== 'undefined' && !window.SEED_RECORDS) {
  window.SEED_RECORDS = SEED_RECORDS;
}
