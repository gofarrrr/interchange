# Origins and ongoing curation — v1.1

## What the owner asked to make explicit

INTERCHANGE grew from two lists shared on X. Credit both authors prominently in About and keep direct links to their exact posts:

- Mark Ajzenstadt, @mardehaym: [the 30-point list](https://x.com/mardehaym/status/2103172822067466587).
- Alex Lieberman, @businessbarista: [the 37-point list](https://x.com/businessbarista/status/2102763567422251107).

The owner used these lists to create the current 36-station synthesis. The original authors are credited for inspiration, not presented as authors, reviewers or endorsers of INTERCHANGE. Do not use their logos, invent testimonials, or mirror the posts in full.

### Verification scope of this update

The owner provided the exact two URLs and the original list texts earlier in the conversation. Search-index results for those exact X status pages confirmed the author names, handles and opening titles. Direct page retrieval returned HTTP 403. The complete live posts and exact publication dates were not independently re-verified. Accordingly no exact post dates or claims of endorsement are shown. This identity/title check is not a new source-evidence review for the 36 stations.

## How About is maintained

`content/about.json` holds the editable origin credits and living-guide statement. `src/about.mjs` validates the fields and explicitly projects only public ones. Its `_provenance` section is internal and never shipped in the generated HTML or public data. The same renderer builds About for static hosting, offline HTML and the optional Astro adapter. `ABOUT.md` is a generated reading copy; rebuild after editing the JSON.

Origin credits remain separate from `content/sources/` and `content/evidence/`. They do not count toward research-source families or source-perspective records (which stood at 31 and 60 respectively in the v1.1 baseline, prior to the v1.3 operational additions). If a particular post is later used to support a station claim, add a separately reviewed, attributed evidence record for that specific use.

## The guide is open to revision

The 36 stable station IDs are the organising structure, not 36 final answers. New material should earn its place by improving the reader’s understanding. A useful source can reinforce a claim, qualify its scope, challenge it, offer a different perspective, or suggest an alternative approach. Disagreement should be attributed and explained, not flattened into a false consensus.

This is a curator-led workflow. No automatic ingestion, scheduled monitoring, feed, newsletter, analytics or claims of constant freshness were added. There is no promise of a weekly or monthly review. Do not display build timestamps as “last reviewed”.

## When a useful new source is found

1. **Capture the original.** Record author, title, original URL, known publication date, access conditions and an exact locator. Save private reading notes outside `public/` and the public build.
2. **Identify the contribution.** In one sentence explain which station it belongs to and what changes: a new lens, a qualification, a challenge, a practical alternative or a correction. Mere topical similarity is not enough.
3. **Check the source family.** Reuse an existing source ID for the same work. Several summaries of one paper do not become several independent sources.
4. **Add a bounded perspective.** Use `content/evidence/`; distinguish the author’s claim from your interpretation. State context, limits and the original locator. Keep an unreviewed record pending rather than inventing approval.
5. **Revise the station where needed.** Link the new evidence and source IDs; update the diagnosis, questions, actions or limitations only when warranted. Never change station IDs/slugs merely to mark an update.
6. **Reopen affected approvals.** A changed claim invalidates the previous approval of that claim. Set the affected station/evidence review status back to pending, review the new version, then record the actual reviewer and date. Do not copy an old approval onto new content.
7. **Review related entries.** Check any other station using the same source/evidence. If the interpretation or source limitation changes, review those uses too.
8. **Record the substantive change.** Use a dated editorial note stating the station, old interpretation, new interpretation, source and reason. Version control preserves earlier wording. A small site-level “recent updates” view can be added later once real reviewed station updates exist; it is not implemented in v1.1.
9. **Validate and preview.** Run `npm run validate`, `npm test`, `npm run build`, `npm run check:links`. Read the affected page and original source before release. The existing public gate remains in effect.

See [CONTENT-EDITING.md](CONTENT-EDITING.md) for the actual source/evidence/station schemas and approval requirements. Adding a new post URL is not itself evidence that the associated claim has been verified.

## Acceptance criteria

- About names both authors and links to the exact original posts.
- The 36-station synthesis is distinguished from those original posts.
- The living-guide statement explains nuance, different lenses, counterarguments and alternative approaches.
- Attribution and source limitations remain visible; credit is not endorsement.
- Origin credits do not add research/evidence counts or approve draft claims.
- All links work with keyboard, without embeds, in the static and offline versions.
- No automatic freshness date or scheduled-monitoring claim is introduced.
