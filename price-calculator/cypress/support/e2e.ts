import '@testing-library/cypress/add-commands'

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click()
})

// Custom command to check if user is authenticated
Cypress.Commands.add('isAuthenticated', () => {
  return cy.window().its('localStorage').invoke('getItem', 'token')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      isAuthenticated(): Chainable<string | null>
    }
  }
} 