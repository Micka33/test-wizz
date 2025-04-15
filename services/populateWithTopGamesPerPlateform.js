class PopulateWithTopGamesPerPlateformService {
  /**
   * @param {string} androidURL
   * @param {string} iosURL
   * @param {import('sequelize').Sequelize} db
   */
  constructor(androidURL, iosURL, db, topN = 100) {
    this.androidURL = androidURL;
    this.iosURL = iosURL;
    this.db = db;
    this.topN = topN;
  }

  call() {
    const populateResponse = {
      android: {
        success: true,
        message: 'Android games populated successfully',
      },
      ios: {
        success: true,
        message: 'iOS games populated successfully',
      },
    };

    return Promise.allSettled([
      fetch(this.androidURL).then((response) => response.json()),
      fetch(this.iosURL).then((response) => response.json()),
    ])
      .then((results) => {
        const androidResult = results[0];
        const iosResult = results[1];
        const androidIsSuccess = androidResult.status === 'fulfilled';
        const iosIsSuccess = iosResult.status === 'fulfilled';

        if (!androidIsSuccess) {
          populateResponse.android.success = false;
          populateResponse.android.message = androidResult.reason;
        }
        if (!iosIsSuccess) {
          populateResponse.ios.success = false;
          populateResponse.ios.message = iosResult.reason;
        }
        // early return if no data or all error
        if (!androidIsSuccess || !iosIsSuccess ||
            (androidResult.value.length === 0 && iosResult.value.length === 0)) {
          return null;
        }
        // implement json schema check here
        // prepare data for db
        const androidGames = androidIsSuccess ? this.formatGames(this.filterGames(androidResult.value, this.topN)) : [];
        const iosGames = iosIsSuccess ? this.formatGames(this.filterGames(iosResult.value, this.topN)) : [];
        // insert data in db
        return this.db.sequelize.transaction(async (transaction) => {
          if (androidIsSuccess) {
            await this.db.Game.bulkCreate(androidGames, { transaction });
          }
          if (iosIsSuccess) {
            await this.db.Game.bulkCreate(iosGames, { transaction });
          }
        });
      })
      .then(() => populateResponse);
  }

  /**
   * @param {Array<Array<Object>>} games
   * @param {number} topN
   * @returns {Array<Object>}
   */
  // eslint-disable-next-line class-methods-use-this
  filterGames(games, topN) {
    // seems there are more than 100 games in the response and we don't know how to rank them
    // This a temporary solution to get the top 100 games until we know more about the need
    return games.flat().sort((a, b) => a.rank - b.rank).slice(0, topN);
  }

  /**
   * @param {Array<Object>} games
   * @returns {Array<Object>}
   */
  formatGames(games) {
    const formattedValues = [];
    games.forEach((game) => {
      formattedValues.push(this.formatGame(game));
    });
    return formattedValues;
  }

  /**
   * @param {Object} game
   * @returns {Object}
   */
  // eslint-disable-next-line class-methods-use-this
  formatGame(game) {
    return {
      publisherId: game.publisher_id,
      name: game.name,
      platform: game.os,
      storeId: game.id,
      bundleId: game.bundle_id,
      appVersion: game.version,
      isPublished: new Date(game.release_date) <= new Date(),
    };
  }
}

module.exports = PopulateWithTopGamesPerPlateformService;
