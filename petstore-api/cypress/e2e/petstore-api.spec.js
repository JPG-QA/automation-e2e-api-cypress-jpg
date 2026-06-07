const PetService = require('../pages/petService');

describe('PetStore API - Opción 2 (POM)', () => {
  const petService = new PetService();
  const createdIds = [];
  const petId = Date.now();
  const petName = `MyPet-${petId}`;
  const updatedName = `${petName}-Sold`;
  const initialPet = {
    id: petId,
    name: petName,
    photoUrls: ['https://example.com/pet.jpg'],
    status: 'available'
  };
  const updatedPet = {
    id: petId,
    name: updatedName,
    photoUrls: ['https://example.com/pet.jpg'],
    status: 'sold'
  };

  before(() => {
    petService.createPet(initialPet).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(petId);
      expect(response.body.name).to.equal(petName);
      createdIds.push(petId);
    });
  });

  it('Debería añadir una mascota a la tienda', () => {
    const newPet = {
      id: petId + 1,
      name: `${petName}-new`,
      photoUrls: ['https://example.com/pet.jpg'],
      status: 'available'
    };

    petService.createPet(newPet).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(newPet.id);
      expect(response.body.name).to.equal(newPet.name);
      createdIds.push(newPet.id);
    });
  });

  it('Debería consultar la mascota ingresada previamente (Búsqueda por ID)', () => {
    petService.getPetById(petId).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(petId);
      expect(response.body.name).to.equal(petName);
    });
  });

  it('Debería actualizar el nombre y el estatus de la mascota a sold', () => {
    petService.updatePet(updatedPet).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(petId);
      expect(response.body.name).to.equal(updatedName);
      expect(response.body.status).to.equal('sold');
    });
  });

  it('Debería consultar la mascota modificada por estado sold', () => {
    petService.getPetsByStatus('sold').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      const ids = response.body.map((pet) => pet.id);
      expect(ids).to.include(petId);
    });
  });

  after(() => {
    if (createdIds.length) {
      createdIds.forEach((id) => {
        petService.deletePet(id).then((res) => {
          // Accept 200, 204 (deleted) or 404 (already removed)
          expect([200, 204, 404]).to.include(res.status);
        });
      });
    }
  });
});
