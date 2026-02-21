function StatsCard({ title, value, hint }) {
  return (
    <article className="stats-card">
      <h3>{title}</h3>
      <p className="stats-value">{value}</p>
      <small>{hint}</small>
    </article>
  )
}

export default StatsCard
