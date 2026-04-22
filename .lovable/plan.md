
## Fjern genveje øverst til højre på Admin Dashboard

**Hvad ændres:**
På `/admin/dashboard` fjernes de to knapper øverst til højre:
- "Se alle TSB'er"
- "+ Ny TSB"

Navigationen til disse findes allerede i venstre sidemenu og under de relevante faner, så genvejene er overflødige.

**Hvad bevares:**
- Titel "Admin Dashboard" og undertekst til venstre
- KPI-kort (Aktive TSB'er, Afventer accept, Nær deadline, Forsinket)
- "Hurtige handlinger"-sektionen længere nede (Opret ny TSB, Administrer TSB'er, Forhandlere) — disse er kontekstuelle kort, ikke header-genveje
- "Kræver opmærksomhed"-tabellen

**Filer der ændres:**
- `src/routes/admin.dashboard.tsx` — fjern `<div>` med de to `<Link>`/`<Button>` i header-rækken, samt nu ubrugte imports (`Plus`, `Button`, `Link` hvis ikke brugt andre steder i filen)

**Resultat:**
Header-rækken viser kun titel + beskrivelse til venstre, og højre side er ren. Layoutet bliver mere roligt og undgår dobbelt-navigation.
