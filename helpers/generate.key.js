const crypto = require('crypto');

const a_t_k_e_y  = crypto.randomBytes(32).toString('hex');
const r_t_k_e_y  = crypto.randomBytes(32).toString('hex');

// console.table({a_t_k_e_y, r_t_k_e_y});

module.exports = {a_t_k_e_y, r_t_k_e_y}