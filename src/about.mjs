/** Public About content: origin credits are not station evidence. */
import {safeURL} from './url.mjs';
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

/** Validate the editable record. Internal provenance is never rendered. */
export function validateAbout(about) {
  const errors = [];
  if (!about || typeof about !== 'object') return ['Missing About content.'];
  for (const key of ['id', 'title', 'intro']) {
    if (!nonempty(about[key])) errors.push(`Missing About ${key}.`);
  }
  const origins = about.origins;
  for (const key of ['heading', 'intro', 'synthesis', 'credit_note']) {
    if (!nonempty(origins?.[key])) errors.push(`Missing origins ${key}.`);
  }
  const credits = origins?.credits;
  if (!Array.isArray(credits) || credits.length < 2) {
    errors.push('Keep both founding origin credits.');
  } else {
    const ids = new Set();
    const urls = new Set();
    for (const credit of credits) {
      if (!nonempty(credit?.id) || !/^[a-z0-9-]+$/.test(credit.id)) errors.push('Invalid origin ID.');
      if (ids.has(credit?.id)) errors.push('Duplicate origin ID.');
      ids.add(credit?.id);
      for (const key of ['author', 'handle', 'title']) {
        if (!nonempty(credit?.[key])) errors.push(`Missing origin ${key}.`);
      }
      const url = safeURL(credit?.url);
      if (!url || !url.startsWith('https://')) errors.push('Unsafe origin URL.');
      if (urls.has(url)) errors.push('Duplicate origin URL.');
      urls.add(url);
      if (!Number.isInteger(credit?.list_size) || credit.list_size < 1) errors.push('Invalid origin list size.');
    }
  }
  const living = about.living_guide;
  if (!nonempty(living?.heading) || !nonempty(living?.principle) ||
      !Array.isArray(living?.paragraphs) || !living.paragraphs.length || !living.paragraphs.every(nonempty)) {
    errors.push('Missing living-guide statement.');
  }
  const approach = about.editorial_approach;
  if (!nonempty(approach?.heading) || !nonempty(approach?.closing) ||
      !Array.isArray(approach?.items) || !approach.items.length ||
      !approach.items.every(item => nonempty(item?.title) && nonempty(item?.text))) {
    errors.push('Missing editorial approach.');
  }
  return errors;
}

/** Explicit public allowlist. No reviewer, internal note or research file path leaks. */
export function projectAbout(about) {
  const errors = validateAbout(about);
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    id: about.id, title: about.title, intro: about.intro,
    origins: {
      heading: about.origins.heading, intro: about.origins.intro,
      credits: about.origins.credits.map(c => ({
        id: c.id, author: c.author, handle: c.handle, title: c.title,
        list_size: c.list_size, url: safeURL(c.url)
      })),
      synthesis: about.origins.synthesis, credit_note: about.origins.credit_note
    },
    living_guide: {
      heading: about.living_guide.heading, paragraphs: [...about.living_guide.paragraphs],
      principle: about.living_guide.principle
    },
    editorial_approach: {
      heading: about.editorial_approach.heading,
      items: about.editorial_approach.items.map(i => ({title: i.title, text: i.text})),
      closing: about.editorial_approach.closing
    }
  };
}

/** Build a reading copy from the same public record; never edit ABOUT.md by hand. */
export function aboutMarkdown(record) {
  const a=projectAbout(record);
  const rows=['# About INTERCHANGE','','> Editorial preview. Edit `content/about.json`; this reading copy is generated.','','## '+a.title,'',a.intro,'','## '+a.origins.heading,'',a.origins.intro,''];
  for (const c of a.origins.credits) rows.push(`**${c.author} (${c.handle})**`,'',`[${c.title}](${c.url})`,'');
  rows.push(a.origins.synthesis,'',a.origins.credit_note,'','## '+a.living_guide.heading,'',...a.living_guide.paragraphs.flatMap(p=>[p,'']),'**'+a.living_guide.principle+'**','','## '+a.editorial_approach.heading,'');
  for (const i of a.editorial_approach.items) rows.push('### '+i.title,'',i.text,'');
  rows.push(a.editorial_approach.closing,'');
  return rows.join('\n');
}
