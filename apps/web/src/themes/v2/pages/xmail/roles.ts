// Type roles of docs/STANDARDS.md as complete literal class lists: the size, and the role line height token of the
// kit (--lh-*), which is taller for Arabic.
// The mailbox pages compose sender, subject, snippet and date hierarchies from these roles only.
export const ROLE = {
  caption: 'text-[0.8125rem] leading-(--lh-cap)',
  label: 'text-sm leading-(--lh-label)',
  body: 'text-base leading-(--lh-text)',
  cardHeading: 'text-lg leading-(--lh-card)',
  pageHeading: 'text-[1.625rem] leading-(--lh-page)',
} as const
