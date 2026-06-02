interface NavLink {
  href: string
  label: string
}

interface Props {
  brand: string
  links: NavLink[]
}

export function ReportNav({ brand, links }: Props) {
  return (
    <nav className="report-nav">
      <div className="report-nav-inner">
        <div className="report-brand">{brand}</div>
        <div className="report-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
