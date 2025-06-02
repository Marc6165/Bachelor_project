describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should redirect to login when not authenticated', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Login failed')
  })

  it('should successfully login with valid credentials', () => {
    // Replace these with your actual test credentials
    const testEmail = 'test@test.com'
    const testPassword = 'test'

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').type(testPassword)
    cy.get('button[type="submit"]').click()
    
    // Wait for the redirect to complete
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('not.be.null')
  })

  it('should successfully logout', () => {
    // First login
    const testEmail = 'test@test.com'
    const testPassword = 'test'

    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').type(testPassword)
    cy.get('button[type="submit"]').click()
    
    // Wait for login to complete
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Then logout
    cy.get('[data-testid="logout-button"]').click()
    cy.url().should('include', '/login')
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null')
  })
}) 