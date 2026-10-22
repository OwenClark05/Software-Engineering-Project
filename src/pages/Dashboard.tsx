type DashboardProps = {
  onLogout: () => Promise<void>
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <main>
      <h1>Your dashboard</h1>
      <p>This page is shown after you sign in.</p>
      <button onClick={onLogout}>Sign out</button>
    </main>
  )
}