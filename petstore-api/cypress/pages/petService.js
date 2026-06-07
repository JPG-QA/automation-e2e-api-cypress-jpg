class PetService {
  constructor() {
    this.baseUrl = 'https://petstore.swagger.io/v2';
  }

  createPet(pet) {
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/pet`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: pet
    });
  }

  getPetById(petId) {
    return cy.request('GET', `${this.baseUrl}/pet/${petId}`);
  }

  updatePet(pet) {
    return cy.request({
      method: 'PUT',
      url: `${this.baseUrl}/pet`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: pet
    });
  }

  deletePet(petId) {
    return cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}/pet/${petId}`
    });
  }

  getPetsByStatus(status) {
    return cy.request('GET', `${this.baseUrl}/pet/findByStatus?status=${status}`);
  }
}

module.exports = PetService;
