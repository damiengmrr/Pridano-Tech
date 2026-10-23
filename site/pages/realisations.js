const { projects } = require('../data/brand');
const { pt, label, link, picture, extAttrs, newTab } = require('../lib/html');
const s = require('../components/sections');
const { heroMedia } = require('../components/hero-media');

function editorial() {
  return projects.map((p, i) => `<article class="case${i % 2 ? ' case--flip' : ''}" id="${p.id}" data-index-label="${p.name}">
<a class="case-visual" href="${p.href}"${extAttrs(p.href)} data-cursor="Voir" data-umami-event="realisation:${p.id}"${i === 0 ? '' : ' data-reveal="scale"'}>
<span class="case-status">${p.status}</span>
${p.site ? `<span class="case-devices"><span class="case-browser"><span class="case-browser-bar" aria-hidden="true"><i></i><i></i><i></i><b>${p.href.replace('https://', '')}</b></span>${picture(p.site, { alt: p.siteAlt, sizes: '(min-width: 1000px) 46vw, calc(100vw - 4.5rem)' })}</span><span class="case-phone">${picture(p.siteMobile, { alt: p.siteMobileAlt, sizes: '(min-width: 1000px) 11vw, 22vw' })}</span></span>` : picture(p.image, { alt: p.alt, sizes: '(min-width: 1000px) 56vw, 94vw' })}
<span class="visually-hidden">${p.linkLabel} : ${p.name}${newTab(p.href)}</span>
</a>
<div class="case-copy" data-reveal>
<p class="case-num">${String(i + 1).padStart(2, '0')} <small>/ Sélection</small></p>
${label(p.type)}
<h2 class="h2">${pt(`${p.name}.`)}</h2>
<p class="case-text">${p.text}</p>
<ul class="tags" role="list">${p.tags.map((t) => `<li class="tag">${t}</li>`).join('')}</ul>
${link({ href: p.href, label: p.linkLabel })}
</div>
</article>`).join('');
}

module.exports = {
  title: 'Réalisations — Sites web',
  description: 'Découvrez les références réelles de Pridano : les sites de Solaria Média et de Prévenir Pour Gagner, en ligne.',
  crumb: 'Réalisations',
  schemaType: 'CollectionPage',
  body: () => `${s.pageHero({
    crumb: 'Réalisations',
    kicker: 'Réalisations · Une sélection',
    title: 'Le travail parle. Regardez de plus près.',
    lead: 'Une agence. Un site associatif. Des besoins différents, une attention commune au détail.',
    media: heroMedia.work(),
  })}
<div class="cases wrap">${editorial()}</div>
${s.testimonialsSection()}
<p class="wrap fine-print cases-note">Les visuels sont des captures des sites en ligne. Ouvrez chaque lien pour découvrir le site complet.</p>
${s.finalCta()}`,
};
