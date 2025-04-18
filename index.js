const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const PopulateWithTopGamesPerPlateformService = require('./services/populateWithTopGamesPerPlateform');

const env = process.env.NODE_ENV || 'development';
const appConfig = require('./config/appConfig.json')[env];

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get('/api/games', (req, res) => db.Game.findAll()
  .then((games) => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then((game) => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});

app.post('/api/games/search', (req, res) => {
  const { name, platform } = req.body;
  const where = {};
  if (typeof name === 'string' && name.length > 0) {
    where.name = {
      [db.Sequelize.Op.like]: `%${name}%`,
    };
  }
  if (typeof platform === 'string' && platform.length > 0) {
    where.platform = platform;
  }
  return db.Game.findAll({ where })
    .then((game) => res.send(game))
    .catch((err) => {
      console.log('***Error searching for games', err);
      return res.status(400).send(err);
    });
});

app.post('/api/games/populate', (_req, res) => {
  const { androidURL, iosURL } = appConfig;
  const service = new PopulateWithTopGamesPerPlateformService(androidURL, iosURL, db);
  return service.call()
    .then((serviceResponse) => res.send(serviceResponse))
    .catch((err) => {
      console.log('***Error populating games', err);
      return res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
