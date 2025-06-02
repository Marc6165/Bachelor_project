describe('Calculator', () => {
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

  it('should create a new calculator', () => {
    // Navigate to create calculator page
    cy.visit('/create-calculator')
    
    // Wait for the page to load and verify we're authenticated
    cy.url().should('include', '/create-calculator')
    cy.get('[data-testid="calculator-hourly-wage"]', { timeout: 10000 }).should('be.visible')
    
    // Fill in calculator details
    cy.get('[data-testid="calculator-hourly-wage"]').clear().type('150')
    cy.get('[data-testid="calculator-type"]').select('window-cleaning')
    
    // Save calculator and wait for navigation
    cy.get('[data-testid="save-calculator"]').click()
    
    // Wait for the API call to complete and navigation to happen
    cy.intercept('POST', '**/api/calculators/create').as('createCalculator')
    cy.wait('@createCalculator').its('response.statusCode').should('eq', 201)
    
    // Verify navigation to calculator page
    cy.url().should('include', '/calculator/')
    cy.get('[data-testid="calculator-input-area"]', { timeout: 10000 }).should('be.visible')
  })

  it('should embed calculator', () => {
    // Navigate to create calculator page
    cy.visit('/create-calculator')
    
    // Wait for the page to load and verify we're authenticated
    cy.url().should('include', '/create-calculator')
    cy.get('[data-testid="calculator-hourly-wage"]', { timeout: 10000 }).should('be.visible')
    
    // Fill in calculator details
    cy.get('[data-testid="calculator-hourly-wage"]').clear().type('150')
    cy.get('[data-testid="calculator-type"]').select('window-cleaning')
    
    // Save calculator and wait for navigation
    cy.get('[data-testid="save-calculator"]').click()
    
    // Wait for the API call to complete and navigation to happen
    cy.intercept('POST', '**/api/calculators/create').as('createCalculator')
    cy.wait('@createCalculator').its('response.statusCode').should('eq', 201)
    
    // Verify navigation to calculator page
    cy.url().should('include', '/calculator/')
    cy.get('[data-testid="calculator-input-area"]', { timeout: 10000 }).should('be.visible')
    
    // Wait for iframe to be visible
    cy.get('iframe', { timeout: 10000 }).should('be.visible')
  })

  it('should use calculator', () => {
    // Navigate to create calculator page
    cy.visit('/create-calculator')
    
    // Wait for the page to load and verify we're authenticated
    cy.url().should('include', '/create-calculator')
    cy.get('[data-testid="calculator-hourly-wage"]', { timeout: 10000 }).should('be.visible')
    
    // Fill in calculator details
    cy.get('[data-testid="calculator-hourly-wage"]').clear().type('150')
    cy.get('[data-testid="calculator-type"]').select('window-cleaning')
    
    // Save calculator and wait for navigation
    cy.get('[data-testid="save-calculator"]').click()
    
    // Wait for the API call to complete and navigation to happen
    cy.intercept('POST', '**/api/calculators/create').as('createCalculator')
    cy.wait('@createCalculator').its('response.statusCode').should('eq', 201)
    
    // Verify navigation to calculator page
    cy.url().should('include', '/calculator/')
    cy.get('[data-testid="calculator-input-area"]', { timeout: 10000 }).should('be.visible')
  })

  it('should save quote', () => {
    // Navigate to create calculator page
    cy.visit('/create-calculator')
    
    // Wait for the page to load and verify we're authenticated
    cy.url().should('include', '/create-calculator')
    cy.get('[data-testid="calculator-hourly-wage"]', { timeout: 10000 }).should('be.visible')
    
    // Fill in calculator details
    cy.get('[data-testid="calculator-hourly-wage"]').clear().type('150')
    cy.get('[data-testid="calculator-type"]').select('window-cleaning')
    
    // Save calculator and wait for navigation
    cy.get('[data-testid="save-calculator"]').click()
    
    // Wait for the API call to complete and navigation to happen
    cy.intercept('POST', '**/api/calculators/create').as('createCalculator')
    cy.wait('@createCalculator').its('response.statusCode').should('eq', 201)
    
    // Verify navigation to calculator page
    cy.url().should('include', '/calculator/')
    cy.get('[data-testid="calculator-input-area"]', { timeout: 10000 }).should('be.visible')
    
    // Select a floor - use force: true to handle overlapping elements
    cy.get('svg g').first().click({ force: true })
    
    // Click next
    cy.contains('Næste').click()
    
    // Select window type
    cy.get('select').first().select('Ja')
    
    // Select cleaning type
    cy.contains('Udvendig').click()
    
    // Select dirtiness
    cy.contains('Normal').click()
    
    // Click next
    cy.contains('Næste').click()
    
    // Select windows - use force: true for the button click
    cy.get('button').contains('+').first().click({ force: true })
    
    // Click next
    cy.contains('Næste').click()
    
    // Click next to contact form
    cy.contains('Næste').click()
    
    // Fill contact form
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('input[name="phone"]').type('12345678')
    cy.get('input[name="address"]').type('Test Address')
    cy.get('input[name="city"]').type('Test City')
    cy.get('input[name="zip"]').type('1234')
    
    // Submit form and wait for API call
    cy.intercept('POST', '**/api/quotes').as('createQuote')
    cy.contains('Kontakt mig').click()
    cy.wait('@createQuote').its('response.statusCode').should('eq', 201)
    
    // Navigate to quotes page and verify quote was created
    cy.visit('/quotes')
    cy.contains('Pending Quotes', { timeout: 10000 }).should('be.visible')
    
    // Check for the quote in the pending quotes section by email
    cy.get('table').first().within(() => {
      cy.contains('test@test.com', { timeout: 10000 }).should('be.visible')
    })
  })
}) 