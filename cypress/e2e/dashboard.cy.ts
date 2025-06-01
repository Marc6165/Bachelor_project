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
    cy.get('[data-testid="dashboard-title"]').should('be.visible')
  })

  it('should navigate to quotes page', () => { 
    cy.get('[data-testid="quotes-link"]').should('be.visible').click()
    cy.url().should('include', '/quotes')
    cy.get('[data-testid="quotes-title"]').should('be.visible')
  })

  it('should navigate to create calculator page', () => {
    cy.get('[data-testid="create-calculator-link"]').should('be.visible').click()
    cy.url().should('include', '/create-calculator')
    cy.get('[data-testid="create-calculator-title"]').should('be.visible')
  })

  it('should navigate to embed calculator page', () => {
    cy.get('[data-testid="embed-calculator-link"]').should('be.visible').click()
    cy.url().should('include', '/embed-calculator')
    cy.get('[data-testid="embed-calculator-title"]').should('be.visible')
  })

  it('should display recent calculators', () => {
    cy.get('[data-testid="recent-calculators"]').should('be.visible')
  })

  it('should display recent quotes', () => {
    cy.get('[data-testid="recent-quotes"]').should('be.visible')
  })
}) 