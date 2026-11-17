import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../utils/supabase'

type DashboardProps = { onLogout: () => Promise<void> }

type VaultItem = {
  id: string
  title: string
  username: string
  password: string
  url: string
  notes: string
}

type VaultForm = Omit<VaultItem, 'id'>

const emptyForm: VaultForm = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [items, setItems] = useState<VaultItem[]>([])
  const [form, setForm] = useState<VaultForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadItems() {
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('vault_items')
      .select('*')
      .order('title')

    if (loadError) setError(loadError.message)
    else setItems((data ?? []) as VaultItem[])
    setLoading(false)
  }

  useEffect(() => {
    void loadItems()
  }, [])

  function updateField(field: keyof VaultForm, value: string) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.title.trim() || !form.password) {
      setError('A site name and password are required.')
      return
    }

    const values = {
      ...form,
      title: form.title.trim(),
      username: form.username.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
    }

    const result = editingId
      ? await supabase.from('vault_items').update(values).eq('id', editingId)
      : await supabase.from('vault_items').insert(values)

    if (result.error) {
      setError(result.error.message)
      return
    }

    setForm(emptyForm)
    setEditingId(null)
    await loadItems()
  }

  function startEditing(item: VaultItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      username: item.username,
      password: item.password,
      url: item.url,
      notes: item.notes,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function removeItem(id: string) {
    if (!window.confirm('Delete this login?')) return

    const { error: deleteError } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', id)

    if (deleteError) setError(deleteError.message)
    else setItems(current => current.filter(item => item.id !== id))
  }

  function togglePassword(id: string) {
    setRevealedIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpanded(id: string) {
    setExpandedIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function copyPassword(password: string) {
    await navigator.clipboard.writeText(password)
  }

  const visibleItems = items.filter(item =>
    `${item.title} ${item.username} ${item.url}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )

  return (
    <main>
      <header className="vault-header">
        <div>
          <h1>Password vault</h1>
          <p>Your private logins, available only to you.</p>
        </div>
        <button onClick={onLogout}>Sign out</button>
      </header>

      <form onSubmit={saveItem} className="vault-form">
        <h2>{editingId ? 'Edit login' : 'Add a login'}</h2>
        <div className="form-grid">
          <label>
            Site or app
            <input value={form.title} onChange={event => updateField('title', event.target.value)} required />
          </label>
          <label>
            Website URL
            <input type="url" value={form.url} onChange={event => updateField('url', event.target.value)} />
          </label>
          <label>
            Username or email
            <input value={form.username} onChange={event => updateField('username', event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={event => updateField('password', event.target.value)} autoComplete="new-password" required />
          </label>
        </div>
        <label>
          Notes
          <textarea value={form.notes} onChange={event => updateField('notes', event.target.value)} rows={2} />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">{editingId ? 'Save changes' : 'Add login'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel</button>}
      </form>

      <section>
        <div className="vault-list-header">
          <h2>Your logins ({items.length})</h2>
          <input aria-label="Search logins" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        {loading ? <p>Loading vault…</p> : visibleItems.length === 0 ? <p>{items.length ? 'No matching logins.' : 'Your vault is empty. Add your first login above.'}</p> : (
          <div className="vault-list">
            {visibleItems.map(item => (
              <article className="vault-card" key={item.id}>
                <button
                  type="button"
                  className="vault-card-header"
                  aria-expanded={expandedIds.has(item.id)}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <span>{item.title}</span>
                  <span aria-hidden="true">{expandedIds.has(item.id) ? '▴' : '▾'}</span>
                </button>
                {expandedIds.has(item.id) && (
                  <div className="vault-card-content">
                    <div>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a>}
                      <p>{item.username || 'No username saved'}</p>
                      <code>{revealedIds.has(item.id) ? item.password : '••••••••••'}</code>
                      {item.notes && <p>{item.notes}</p>}
                    </div>
                    <div className="card-actions">
                      <button type="button" onClick={() => togglePassword(item.id)}>{revealedIds.has(item.id) ? 'Hide' : 'Reveal'}</button>
                      <button type="button" onClick={() => void copyPassword(item.password)}>Copy password</button>
                      <button type="button" onClick={() => startEditing(item)}>Edit</button>
                      <button type="button" onClick={() => void removeItem(item.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
