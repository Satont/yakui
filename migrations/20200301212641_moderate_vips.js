
exports.up = async function(knex) {
  return await knex('systems.moderation').select('*').then(async (rows) => {
      for await (let row of rows) {
        if (row.name === 'main' || row.name === 'blacklist') continue
        return await knex('systems.moderation').where('name', row.name).update({
          settings: { ...row.settings, moderateVips: false, whitelist: [] }
        }).catch(console.log)
      }
    })
};

exports.down = function(knex) {
  
};
