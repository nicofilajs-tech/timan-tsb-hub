
## Fjern "Hurtige handlinger"-sektionen fra Admin Dashboard

**Hvad ændres:**
På `/admin/dashboard` fjernes hele "Hurtige handlinger"-sektionen med de tre kort:
- "Opret ny TSB"
- "Administrer TSB'er"
- "Forhandlere"

Disse genveje er overflødige, da navigationen allerede findes i venstre sidemenu.

**Hvad bevares:**
- Titel "Admin Dashboard" og undertekst
- KPI-kort (Aktive TSB'er, Afventer accept, Nær deadline, Forsinket)
- "Kræver opmærksomhed"-tabellen med TSB'er der trænger til handling

**Filer der ændres:**
- `src/routes/admin.dashboard.tsx`
  - Fjern hele `<div className="mt-6 grid ... lg:grid-cols-3">` blokken med de tre `<QuickAction>`-kort
  - Fjern `QuickAction`-hjælpekomponenten i bunden af filen (ikke længere brugt)
  - Ryd ubrugte imports: `Plus`, `FileText`, `Users` fra `lucide-react` (behold `AlertTriangle`, `ArrowRight`, samt `Clock` der allerede er suppress'et)

**Resultat:**
Dashboardet bliver mere fokuseret: KPI'er øverst, og direkte derunder tabellen med TSB'er der kræver opmærksomhed. Ingen dobbelt-navigation.
