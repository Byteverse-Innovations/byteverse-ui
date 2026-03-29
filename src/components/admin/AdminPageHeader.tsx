import React from 'react'

type AdminPageHeaderProps = {
  title: string
  eyebrow?: string
  description?: string
}

export default function AdminPageHeader({ title, eyebrow, description }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <span className="admin-page-header-mark" aria-hidden="true" />
      <div className="admin-page-header-copy">
        {eyebrow ? <p className="admin-page-eyebrow mb-0">{eyebrow}</p> : null}
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-lead mb-0">{description}</p> : null}
      </div>
    </header>
  )
}
