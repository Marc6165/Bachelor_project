describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="password"]').type('test')
    cy.get('button[type="submit"]').click()
    
    // Wait for login to complete and verify token is set
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('not.be.null')
    
    // Wait for navigation to complete and verify we're on the dashboard
    cy.url().should('include', '/')
    cy.get('[data-testid="dashboard-title"]', { timeout: 10000 }).should('be.visible')
  })

  it('should display dashboard after login', () => {
    // Verify we're on the dashboard
    cy.url().should('include', '/')
    cy.get('[data-testid="dashboard-title"]').should('be.visible')
  })

  it('should navigate to quotes page', () => {
    // Click quotes link and verify navigation
    cy.get('[data-testid="quotes-link"]').first().should('be.visible').click()
    cy.url().should('include', '/quotes')
    // Wait for the quotes page to load
    cy.contains('Pending Quotes', { timeout: 10000 }).should('be.visible')
  })

  it('should accept a quote', () => {
    // Navigate to quotes page
    cy.get('[data-testid="quotes-link"]').first().should('be.visible').click()
    cy.url().should('include', '/quotes')
    cy.contains('Pending Quotes', { timeout: 10000 }).should('be.visible')

    // Find and click the accept button for the first quote
    cy.contains('button', 'Accept').first().should('be.visible').click()
    
    // Verify the quote status changed to accepted
    cy.contains('Accepted', { timeout: 10000 }).should('be.visible')
  })

  it('should reject a quote', () => {
    // Navigate to quotes page
    cy.get('[data-testid="quotes-link"]').first().should('be.visible').click()
    cy.url().should('include', '/quotes')
    cy.contains('Pending Quotes', { timeout: 10000 }).should('be.visible')

    // Find and click the dismiss button for the first quote
    cy.contains('button', 'Dismiss').first().should('be.visible').click()
    
    // Verify the quote status changed to dismissed
    cy.contains('Dismissed', { timeout: 10000 }).should('be.visible')
  })
}) 