type DashboardProps = {
  onLogout: () => Promise<void>
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <main>
      <h1>Your dashboard</h1>
      <p>This page is shown after you sign in.</p>
      <fieldset>
        <legend>Your details</legend>
        <p>
          <label htmlFor="dashboard-name">Name</label>
          <br />
          <input id="dashboard-name" name="name" type="text" autoComplete="name" />
        </p>
        <p>
          <label htmlFor="dashboard-email">Email</label>
          <br />
          <input id="dashboard-email" name="email" type="email" autoComplete="email" />
        </p>
        <p>
          <label htmlFor="dashboard-notes">Notes</label>
          <br />
          <textarea id="dashboard-notes" name="notes" rows={4} />
        </p>
        <p>These fields are not saved yet.</p>
      </fieldset>
      <button onClick={onLogout}>Sign out</button>
    </main>
  )
}
