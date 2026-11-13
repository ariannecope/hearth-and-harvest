// "Further reading" footer for detail pages: link groups, each with an optional
// empty-state message. Duplicate URLs across groups are shown only once.
export default function Sources({ groups, note }) {
  const seen = new Set();
  const visible = groups
    .map((g) => ({
      ...g,
      links: (g.links ?? []).filter((link) => {
        if (seen.has(link.url)) return false;
        seen.add(link.url);
        return true;
      }),
    }))
    .filter((g) => g.links.length || g.empty);

  if (!visible.length) return null;
  return (
    <section className="sources" aria-labelledby="further-reading">
      <h2 id="further-reading" className="section-title">Further reading</h2>
      <div className="sources-grid">
        {visible.map((g) => (
          <div key={g.title} className={`sources-group ${g.wide ? 'is-wide' : ''}`}>
            <h3 className="sources-title">{g.title}</h3>
            {g.links.length ? (
              <ul>
                {g.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    {link.note && <span className="source-note">{link.note}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="source-empty">{g.empty}</p>
            )}
          </div>
        ))}
      </div>
      {note && <p className="fine-print">{note}</p>}
    </section>
  );
}
