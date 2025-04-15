const request = require('supertest');
const assert = require('assert');
const app = require('../index');

/**
 * Testing create game endpoint
 */
describe('POST /api/games', () => {
  const data = {
    publisherId: '1234567890',
    name: 'Test App',
    platform: 'ios',
    storeId: '1234',
    bundleId: 'test.bundle.id',
    appVersion: '1.0.0',
    isPublished: true,
  };
  it('respond with 200 and an object that matches what we created', (done) => {
    request(app)
      .post('/api/games')
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.publisherId, '1234567890');
        assert.strictEqual(result.body.name, 'Test App');
        assert.strictEqual(result.body.platform, 'ios');
        assert.strictEqual(result.body.storeId, '1234');
        assert.strictEqual(result.body.bundleId, 'test.bundle.id');
        assert.strictEqual(result.body.appVersion, '1.0.0');
        assert.strictEqual(result.body.isPublished, true);
        return done();
      });
  });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', () => {
  it('respond with json containing a list that includes the game we just created', (done) => {
    request(app)
      .get('/api/games')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body[0].publisherId, '1234567890');
        assert.strictEqual(result.body[0].name, 'Test App');
        assert.strictEqual(result.body[0].platform, 'ios');
        assert.strictEqual(result.body[0].storeId, '1234');
        assert.strictEqual(result.body[0].bundleId, 'test.bundle.id');
        assert.strictEqual(result.body[0].appVersion, '1.0.0');
        assert.strictEqual(result.body[0].isPublished, true);
        return done();
      });
  });
});

/**
 * Testing update game endpoint
 */
describe('PUT /api/games/1', () => {
  const data = {
    id: 1,
    publisherId: '999000999',
    name: 'Test App Updated',
    platform: 'android',
    storeId: '5678',
    bundleId: 'test.newBundle.id',
    appVersion: '1.0.1',
    isPublished: false,
  };
  it('respond with 200 and an updated object', (done) => {
    request(app)
      .put('/api/games/1')
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.publisherId, '999000999');
        assert.strictEqual(result.body.name, 'Test App Updated');
        assert.strictEqual(result.body.platform, 'android');
        assert.strictEqual(result.body.storeId, '5678');
        assert.strictEqual(result.body.bundleId, 'test.newBundle.id');
        assert.strictEqual(result.body.appVersion, '1.0.1');
        assert.strictEqual(result.body.isPublished, false);
        return done();
      });
  });
});

/**
 * Testing update game endpoint
 */
describe('DELETE /api/games/1', () => {
  it('respond with 200', (done) => {
    request(app)
      .delete('/api/games/1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });
});

/**
 * Testing get all games endpoint
 */
describe('GET /api/games', () => {
  it('respond with json containing no games', (done) => {
    request(app)
      .get('/api/games')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 0);
        return done();
      });
  });
});

/**
 * Testing search games endpoint
*/
describe('POST /api/games/search', () => {
  const searchableGames = [{
    publisherId: 'fda4848f-9fe6-4703-8f66-544cc146f1ae',
    name: 'Helix Jump',
    platform: 'ios',
    storeId: '1345968745',
    bundleId: 'com.h8games.falldown',
    appVersion: '2.4.2',
    isPublished: true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  }, {
    publisherId: 'fda4848f-9fe6-4703-8f66-544cc146f1ae',
    name: 'Helix Jump',
    platform: 'android',
    storeId: 'com.h8games.helixjump',
    bundleId: 'com.h8games.helixjump',
    appVersion: '2.4.4',
    isPublished: true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  }, {
    publisherId: 'fda4848f-9fe6-4703-8f66-544cc146f1ae',
    name: 'Swing Rider',
    platform: 'ios',
    storeId: '1441881688',
    bundleId: 'com.semeevs.swingrider',
    appVersion: '1.3',
    isPublished: true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  }, {
    publisherId: 'fda4848f-9fe6-4703-8f66-544cc146f1ae',
    name: 'Swing Rider',
    platform: 'android',
    storeId: 'com.swing.rope',
    bundleId: 'com.swing.rope',
    appVersion: '1.0.3',
    isPublished: true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  }, {
    publisherId: 'c92d2e46-4f85-485c-b2a2-591d7857c93e',
    name: 'Car Crash!',
    platform: 'ios',
    storeId: '1450509345',
    bundleId: 'com.andrew.stunts',
    appVersion: '1.3.1',
    isPublished: true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  }];
  // This is equivalent to a beforeAll hook in Jest
  // here we populate the database with the searchable games
  it('creates searchable games', (done) => {
    Promise.allSettled(searchableGames.map((game) => request(app)
      .post('/api/games')
      .send(game)
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        const persistedGame = response.body;
        game.id = persistedGame.id;
        return response;
      })))
      .then((results) => {
        const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
        if (errors.length > 0) {
          done(new Error(errors.join(', ')));
        } else {
          done();
        }
      });
  });

  // DONE: add tests for the search endpoint
  // DONE: add tests for the search endpoint without params
  // DONE: add tests for the search endpoint with a name
  // DONE: add tests for the search endpoint with a platform
  // DONE: add tests for the search endpoint with a name and platform
  // DONE: add tests for the search endpoint with a lowercase name and platform
  // DONE: add tests for the search endpoint with a uppercase name and platform
  // DONE: add tests for the search endpoint with a partial name

  it('returns all games', (done) => {
    request(app)
      .post('/api/games/search')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 5);
        return done();
      });
  });
  it('returns a list of games that match the given name', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ name: 'Helix Jump' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 2);
        assert.strictEqual(result.body[0].name, 'Helix Jump');
        assert.strictEqual(result.body[1].name, 'Helix Jump');
        return done();
      });
  });
  it('returns a list of games published on the given platform', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ platform: 'ios' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 3);
        assert.strictEqual(result.body[0].platform, 'ios');
        assert.strictEqual(result.body[1].platform, 'ios');
        assert.strictEqual(result.body[2].platform, 'ios');
        return done();
      });
  });
  it('returns a of game that matches the given name and platform', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ name: 'Helix Jump', platform: 'ios' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 1);
        assert.strictEqual(result.body[0].name, 'Helix Jump');
        assert.strictEqual(result.body[0].platform, 'ios');
        return done();
      });
  });
  it('returns a of game that matches the given LOWERCASE name and platform', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ name: 'helix jump', platform: 'ios' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 1);
        assert.strictEqual(result.body[0].name, 'Helix Jump');
        assert.strictEqual(result.body[0].platform, 'ios');
        return done();
      });
  });
  it('returns a of game that matches the given UPPERCASE name and platform', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ name: 'HELIX JUMP', platform: 'ios' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 1);
        assert.strictEqual(result.body[0].name, 'Helix Jump');
        assert.strictEqual(result.body[0].platform, 'ios');
        return done();
      });
  });
  it('returns a list of games that match the given partialname', (done) => {
    request(app)
      .post('/api/games/search')
      .send({ name: 'Helix' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, result) => {
        if (err) return done(err);
        assert.strictEqual(result.body.length, 2);
        assert.strictEqual(result.body[0].name, 'Helix Jump');
        assert.strictEqual(result.body[1].name, 'Helix Jump');
        return done();
      });
  });

  // This is equivalent to a afterAll hook in Jest
  // here we remove the searchable games from the database as we don't need them anymore
  it('removes searchable games', (done) => {
    Promise.allSettled(searchableGames.map((game) => request(app)
      .delete(`/api/games/${game.id}`)
      .set('Accept', 'application/json')
      .expect(200)))
      .then((results) => {
        const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
        if (errors.length > 0) {
          done(new Error(errors.join(', ')));
        } else {
          done();
        }
      });
  });
});
