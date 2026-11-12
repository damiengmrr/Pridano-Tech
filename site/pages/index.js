/* Carte des routes publiques. La clé est l’URL canonique, `file` le fichier généré dans public/. */
const legal = require('./legal');
const { categories } = require('../data/catalog');
const { products } = require('../data/software');
const { categoryPage } = require('./prestation');
const { productPage } = require('./logiciel');

/* Pages générées depuis les catalogues : une par catégorie `generated`, une par logiciel `publishPage`. */
const categoryRoutes = Object.fromEntries(categories.filter((c) => c.generated).map((c) => [c.page, { file: `${c.page.slice(1).replaceAll('/', '-')}.html`, page: categoryPage(c) }]));
const productRoutes = Object.fromEntries(products.filter((p) => p.publishPage).map((p) => [`/logiciels/${p.id}`, { file: `logiciels-${p.id}.html`, page: productPage(p) }]));

module.exports = {
  '/': { file: 'index.html', page: require('./home') },
  '/sites-web': { file: 'sites-web.html', page: require('./sites-web') },
  '/saas': { file: 'saas.html', page: require('./saas') },
  '/prestations': { file: 'prestations.html', page: require('./prestations') },
  ...categoryRoutes,
  '/logiciels': { file: 'logiciels.html', page: require('./logiciels') },
  ...productRoutes,
  '/realisations': { file: 'realisations.html', page: require('./realisations') },
  '/crm': { file: 'crm.html', page: require('./crm') },
  '/a-propos': { file: 'a-propos.html', page: require('./a-propos') },
  '/contact': { file: 'contact.html', page: require('./contact') },
  '/devis': { file: 'devis.html', page: require('./devis') },
  '/mentions-legales': { file: 'mentions-legales.html', page: legal.mentions },
  '/confidentialite': { file: 'confidentialite.html', page: legal.privacy },
  '/404': { file: '404.html', page: legal.notFound, sitemap: false },
};
