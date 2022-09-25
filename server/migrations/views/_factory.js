const executeViewMigration = async (queryInterface, migration) => {
  if (Array.isArray(migration)) {
    for (const subMigration of migration) {
      await executeViewMigration(queryInterface, subMigration)
    }
  } else if (migration instanceof Function) {
    await migration(queryInterface)
  } else if (typeof migration === 'string') {
    await queryInterface.sequelize.query(migration)
  } else {
    throw new Error(`Unhandled migration type ${typeof migration}`)
  }
}

module.exports = (views) => {
  const upViews = views.map(view => view.up)
  const downViews = views.reverse().map(view => view.down)

  return {
    up: async (queryInterface) => {
      if (queryInterface.sequelize.options.dialect !== 'postgres') return
      for (const view of upViews) {
        await executeViewMigration(queryInterface, view)
      }
    },
    down: async (queryInterface) => {
      if (queryInterface.sequelize.options.dialect !== 'postgres') return
      for (const view of downViews) {
        await executeViewMigration(queryInterface, view)
      }
    }
  }
}
