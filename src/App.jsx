import { useState, useEffect } from "react";

const css = {
  p: "#3B4C5E", a: "#C46B57", l: "#F5F5F5", m: "#8B9BA8", b: "#E0E0E0",
  ok: "#0F6E56", okBg: "rgba(29,158,117,.1)",
  warnBg: "rgba(196,107,87,.1)",
};

const ITEMS = [
  { id: "charges", label: "Charges annuelles", pts: 8 },
  { id: "taxe", label: "Taxe foncière", pts: 7 },
  { id: "annee", label: "Année construction", pts: 6 },
  { id: "chauffage", label: "Type chauffage", pts: 6 },
  { id: "exposition", label: "Exposition", pts: 5 },
  { id: "plan", label: "Plan 2D", pts: 5 },
  { id: "parking", label: "Garage / parking", pts: 3 },
  { id: "vtour", label: "Visite virtuelle", pts: 8 },
];

const RECS = [
  { id: "pq", label: "Améliorer photo principale (pièce de vie lumineuse)", impact: 30, check: (v) => v.photoQuality >= 1 },
  { id: "pc", label: "Compléter à ≥ 15 photos HD", impact: 20, check: (v) => v.photoCount >= 15 },
  { id: "dpe", label: "DPE complet (étiquette + kWh)", impact: 25, check: (v) => v.dpe >= 1 },
  { id: "dl", label: "Description ≥ 2000 caractères", impact: 20, check: (v) => v.descLength >= 2000 },
  { id: "vtour", label: "Ajouter visite virtuelle", impact: 15, check: (v) => v.vtour },
  { id: "plan", label: "Intégrer plan 2D", impact: 12, check: (v) => v.plan },
  { id: "taxe", label: "Renseigner taxe foncière", impact: 8, check: (v) => v.taxe },
  { id: "expo", label: "Préciser exposition", impact: 8, check: (v) => v.exposition },
  { id: "chauf", label: "Spécifier type de chauffage", impact: 6, check: (v) => v.chauffage },
];

function ScoreBar({ score }) {
  const color = score >= 80 ? css.ok : score >= 65 ? "#BA7517" : css.a;
  return (
    <div style={{ margin: "1.25rem 0", height: 4, background: "#E8E8E8", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 2, background: color,
        width: score + "%", transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
    </div>
  );
}

function Badge({ ok, children }) {
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 600,
      background: ok ? css.okBg : css.warnBg,
      color: ok ? css.ok : css.a,
    }}>{children}</span>
  );
}

function PortailTag({ ok, children, bg, color }) {
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 10, fontSize: 11, fontWeight: 600,
      background: bg, color,
    }}>{ok ? "✓" : "✗"} {children}</span>
  );
}

export default function App() {
  const [photoQuality, setPhotoQuality] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [dpe, setDpe] = useState(0);
  const [descLength, setDescLength] = useState(0);
  const [checks, setChecks] = useState({
    charges: false, taxe: false, annee: false, chauffage: false,
    exposition: false, plan: false, parking: false, vtour: false,
  });
  const [priceDemanded, setPriceDemanded] = useState("");
  const [priceDVF, setPriceDVF] = useState("");
  const [score, setScore] = useState(0);

  const vals = { photoQuality, photoCount, dpe, descLength, ...checks };

  useEffect(() => {
    const s = {
      pq: photoQuality * 15,
      pc: Math.min(photoCount / 15, 1) * 15,
      dpe: dpe * 15,
      dl: Math.min(descLength / 2000, 1) * 15,
      charges: checks.charges ? 8 : 0,
      taxe: checks.taxe ? 7 : 0,
      annee: checks.annee ? 6 : 0,
      chauffage: checks.chauffage ? 6 : 0,
      exposition: checks.exposition ? 5 : 0,
      vtour: checks.vtour ? 8 : 0,
      plan: checks.plan ? 5 : 0,
      parking: checks.parking ? 3 : 0,
    };
    let raw = Object.values(s).reduce((a, b) => a + b, 0);
    const pd = parseInt(priceDemanded) || 0;
    const pvf = parseInt(priceDVF) || 0;
    if (pd > 0 && pvf > 0 && pd / pvf > 1.05) raw = Math.max(0, raw - 10);
    setScore(Math.min(100, Math.round((raw / 108) * 100)));
  }, [photoQuality, photoCount, dpe, descLength, checks, priceDemanded, priceDVF]);

  const level = score >= 80 ? "Excellent" : score >= 70 ? "Bon" : score >= 55 ? "Moyen" : "Faible";
  const levelColor = score >= 80 ? css.ok : score >= 70 ? "#BA7517" : css.a;

  const pd = parseInt(priceDemanded) || 0;
  const pvf = parseInt(priceDVF) || 0;
  const ratio = pd > 0 && pvf > 0 ? pd / pvf : 1;
  const surcharge = ratio > 1.05 ? Math.round((ratio - 1) * 100) : 0;

  const recs = RECS.filter(r => !r.check(vals)).sort((a, b) => b.impact - a.impact).slice(0, 3);

  const label = { display: "block", fontSize: 11, fontWeight: 600, color: css.p, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 6 };
  const input = { width: "100%", padding: "9px 11px", border: 1px solid +css.b, borderRadius: 6, fontSize: 13, color: css.p, background: "white", outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: css.p, padding: "2rem 1.5rem", background: "#F7F8FA", minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", background: "white", borderRadius: 12, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: css.a, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>BSK Immobilier</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: css.p }}>Diagnostic annonce</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: css.m }}>Score mis à jour en temps réel</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={label}>Photo principale</label>
              <select value={photoQuality} onChange={e => setPhotoQuality(parseFloat(e.target.value))} style={input}>
                <option value={0}>Absente ou mauvaise (entrée, couloir, sombre)</option>
                <option value={0.5}>Moyenne</option>
                <option value={1}>Excellente (pièce de vie, jardin, vue)</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={label}>Nombre de photos</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input type="range" min={0} max={30} step={1} value={photoCount}
                  onChange={e => setPhotoCount(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: css.a }} />
                <span style={{ fontWeight: 600, minWidth: 30 }}>{photoCount}</span>
              </div>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={label}>DPE</label>
              <select value={dpe} onChange={e => setDpe(parseFloat(e.target.value))} style={input}>
                <option value={0}>Absent</option>
                <option value={0.5}>Étiquette seule (sans kWh)</option>
                <option value={1}>Complet (étiquette + kWh)</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={label}>Description (caractères) — min. 2000</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input type="range" min={0} max={3000} step={100} value={descLength}
                  onChange={e => setDescLength(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: css.a }} />
                <span style={{ fontWeight: 600, minWidth: 50 }}>{descLength}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
              {ITEMS.map(item => (
                <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "7px 8px", borderRadius: 4, transition: "background .15s" }}>
                  <input type="checkbox" checked={checks[item.id]}
                    onChange={e => setChecks(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    style={{ accentColor: css.a, cursor: "pointer" }} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div style={{ height: 1, background: "#E8E8E8", margin: "1.25rem 0" }} />
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={label}>Prix demandé (€)</label>
              <input type="number" value={priceDemanded} onChange={e => setPriceDemanded(e.target.value)}
                placeholder="ex: 285000" style={input} />
            </div>
            <div>
              <label style={label}>Médiane DVF local (€) <span style={{ fontWeight: 400, color: css.m }}>optionnel</span></label>
              <input type="number" value={priceDVF} onChange={e => setPriceDVF(e.target.value)}
                placeholder="ex: 270000" style={input} />
            </div>
          </div>
          <div>
            <div style={{ background: "white", border: 1px solid +css.b, borderRadius: 8, padding: "1.75rem 1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: css.m, textTransform: "uppercase", letterSpacing: ".7px" }}>Score complétude</div>
              <div style={{ fontSize: 52, fontWeight: 600, color: css.p, margin: "8px 0 4px", lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 13, color: css.m }}>sur 100</div>
              <ScoreBar score={score} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 }}>
                <PortailTag ok={score >= 80} bg="#E8EFF6" color={css.p}>SeLoger</PortailTag>
                <PortailTag ok={photoCount >= 5} bg={css.warnBg} color={css.a}>Leboncoin</PortailTag>
                <PortailTag ok={score >= 80} bg={css.okBg} color={css.ok}>Bien’ici ≥80%</PortailTag>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: levelColor, textTransform: "uppercase", letterSpacing: ".5px" }}>{level}</div>
            </div>
            {surcharge > 0 && (
              <div style={{ padding: "11px 14px", background: css.warnBg, borderLeft: 3px solid +css.a, borderRadius: "0 4px 4px 0", fontSize: 13, marginBottom: "1rem", lineHeight: 1.5 }}>
                <strong style={{ color: css.a }}>⚠ Surcoté {surcharge}%</strong> vs DVF — perd 60-70% des acheteurs sérieux. Baisse 3-5% recommandée.
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: css.p, textTransform: "uppercase", letterSpacing: ".7px", margin: "1.75rem 0 .75rem" }}>
              À améliorer en priorité
            </div>
            {recs.length > 0 ? recs.map(r => (
              <div key={r.id} style={{ padding: "11px 12px", background: css.l, borderRadius: 6, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: css.a, marginBottom: 3 }}>+{r.impact}% CTR</div>
                <p style={{ fontSize: 13, color: css.p, margin: 0 }}>{r.label}</p>
              </div>
            )) : (
              <div style={{ color: css.m, fontSize: 13, padding: "1rem", textAlign: "center" }}>
                Annonce complète. Prête à publier.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}