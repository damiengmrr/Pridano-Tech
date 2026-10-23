/* Carte des routes publiques. La clé est l’URL canonique, `file` le fichier généré dans public/. */
const legal = require('./legal');

module.exports = {
  '/': { file: 'index.html', page: require('./home') },
  '/sites-web': { file: 'sites-web.html', page: require('./sites-web') },
  '/saas': { file: 'saas.html', page: require('./saas') },
  '/realisations': { file: 'realisations.html', page: require('./realisations') },
  '/crm': { file: 'crm.html', page: require('./crm') },
  '/a-propos': { file: 'a-propos.html', page: require('./a-propos') },
  '/contact': { file: 'contact.html', page: require('./contact') },
  '/devis': { file: 'devis.html', page: require('./devis') },
  '/mentions-legales': { file: 'mentions-legales.html', page: legal.mentions },
  '/confidentialite': { file: 'confidentialite.html', page: legal.privacy },
  '/404': { file: '404.html', page: legal.notFound, sitemap: false },
};
