/// <reference types="cypress" />

context('Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost')
  })

  it('successfully loads', () => {
    cy.visit('http://localhost') // change URL to match your dev URL
  })
})
  