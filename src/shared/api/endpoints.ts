const withId = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  books: {
    list: '/books',
    detail: (bookId: string) => withId('/books', bookId),
  },
  loans: {
    list: '/loans',
    active: '/loans/active',
    history: '/loans/history',
    reading: '/loans/reading',
    detail: (loanId: string) => withId('/loans', loanId),
    renew: (loanId: string) => `${withId('/loans', loanId)}/renew`,
    returnLoan: (loanId: string) => `${withId('/loans', loanId)}/return`,
  },
  wishlist: {
    list: '/wishlist',
    entry: (entryId: string) => withId('/wishlist', entryId),
  },
  reservations: {
    list: '/reservations',
    active: '/reservations/active',
    history: '/reservations/history',
    detail: (reservationId: string) => withId('/reservations', reservationId),
    notifications: (reservationId: string) =>
      `${withId('/reservations', reservationId)}/notifications`,
  },
} as const;
