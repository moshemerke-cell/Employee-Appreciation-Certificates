const { useState, useEffect, useRef, useCallback } = React;

const GENDER_OPTIONS = ["She", "He"];

const PRONOUN_TO_HE = [
  [/\bher\b/g, "his"],
  [/\bHer\b/g, "His"],
  [/\bshe\b/g, "he"],
  [/\bShe\b/g, "He"],
];
const PRONOUN_TO_SHE = [
  [/\bhis\b/g, "her"],
  [/\bHis\b/g, "Her"],
  [/\bhe\b/g, "she"],
  [/\bHe\b/g, "She"],
];

function applyGenderToCitation(citation, gender) {
  const pairs = gender === "He" ? PRONOUN_TO_HE : PRONOUN_TO_SHE;
  let out = citation || "";
  for (const [re, rep] of pairs) out = out.replace(re, rep);
  return out;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  recipientName: "Sarah Goldstein",
  recipientRole: "Patient Coordinator · Foster Ave",
  gender: "She",
  awardTitle: "Patient Outreach Champion",
  certificateNumber: "2026-001",
  citation:
    "for *her dedication to patient outreach* — for the warmth, care, and unwavering commitment she brings to every person who walks through our doors.",
  presentedDate: "May 28, 2026",
  signature1: "Practice Manager",
  signature1Title: "Operations",
  signature2: "Medical Director",
  signature2Title: "Clinical Leadership",
  signature3: "Chief Executive",
  signature3Title: "Premium Health",

  background: "midnight",        // midnight | cream | velvet
  shineStrength: 70,             // 0-100
  holoStrength: 55,              // 0-100
  tiltMax: 14,                   // 0-25 deg
  floatAmplitude: 10,            // 0-24 px
  followMouse: true,
  showFloat: true,
  showHolo: true,
  showShine: true,
}/*EDITMODE-END*/;

const BG_LABELS = ["midnight", "velvet", "cream"];
const BG_CLASS = {
  midnight: "bg-dark",
  velvet:   "bg-velvet",
  cream:    "bg-cream",
};

function slugify(text) {
  return (text || "certificate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadCertificatePng(recipientName) {
  const cert = document.querySelector(".cert");
  if (!cert || typeof html2canvas !== "function") {
    throw new Error("Certificate capture is not available.");
  }

  const float = document.querySelector(".float");
  const tilt = document.querySelector(".tilt");
  const cert3d = document.querySelector(".cert-3d");
  const saved = {
    floatTransform: float?.style.transform,
    floatAnimation: float?.style.animation,
    tiltTransform: tilt?.style.transform,
    cert3dTransform: cert3d?.style.transform,
    cert3dFilter: cert3d?.style.filter,
  };

  if (float) {
    float.style.animation = "none";
    float.style.transform = "none";
  }
  if (tilt) tilt.style.transform = "none";
  if (cert3d) {
    cert3d.style.transform = "none";
    cert3d.style.filter = "none";
  }

  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const canvas = await html2canvas(cert, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#F3EDE6",
      logging: false,
      width: cert.offsetWidth,
      height: cert.offsetHeight,
    });
    const link = document.createElement("a");
    link.download = `${slugify(recipientName)}-certificate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } finally {
    if (float) {
      float.style.animation = saved.floatAnimation || "";
      float.style.transform = saved.floatTransform || "";
    }
    if (tilt) tilt.style.transform = saved.tiltTransform || "";
    if (cert3d) {
      cert3d.style.transform = saved.cert3dTransform || "";
      cert3d.style.filter = saved.cert3dFilter || "";
    }
  }
}

function CornerOrnament() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="#B78449" strokeWidth="0.9" strokeLinecap="round">
      <path d="M2 2 L18 2 M2 2 L2 18"/>
      <path d="M2 2 C 14 8, 22 16, 28 28" strokeWidth="0.7"/>
      <path d="M6 6 C 10 10, 14 14, 18 18" strokeWidth="0.5" opacity="0.6"/>
      <circle cx="2" cy="2" r="2" fill="#B78449" stroke="none"/>
      <circle cx="28" cy="28" r="1.2" fill="#B78449" stroke="none"/>
      <path d="M10 4 Q 16 6, 22 4" strokeWidth="0.5" opacity="0.6"/>
      <path d="M4 10 Q 6 16, 4 22" strokeWidth="0.5" opacity="0.6"/>
    </svg>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);
  const floatRef = useRef(null);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadCertificatePng(t.recipientName);
    } catch (err) {
      console.error(err);
      window.alert("Could not export the certificate image. Try again or use Print → Save as PDF.");
    } finally {
      setDownloading(false);
    }
  }, [t.recipientName]);

  /* Mouse → tilt + shine angle ─────────────────────────────────── */
  useEffect(() => {
    const cert = certRef.current;
    if (!cert) return;

    let rafId = 0;
    let target = { rx: 0, ry: 0 };
    let current = { rx: 0, ry: 0 };

    function onMove(e) {
      if (!t.followMouse) return;
      const r = cert.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // normalize to -1..1, with damping outside the card
      const nx = Math.max(-1.4, Math.min(1.4, (e.clientX - cx) / (r.width / 2)));
      const ny = Math.max(-1.4, Math.min(1.4, (e.clientY - cy) / (r.height / 2)));
      target.rx = ny;
      target.ry = nx;
    }
    function onLeave() {
      target.rx = 0;
      target.ry = 0;
    }

    function tick() {
      // ease toward target
      current.rx += (target.rx - current.rx) * 0.12;
      current.ry += (target.ry - current.ry) * 0.12;
      const rx = current.rx;
      const ry = current.ry;
      cert.style.setProperty('--rx', rx.toFixed(3));
      cert.style.setProperty('--ry', ry.toFixed(3));

      // shine position: highlight opposite the tilt (where reflection lands)
      const shineX = 50 + ry * 40;
      const shineY = 50 - rx * 40;
      cert.style.setProperty('--shine-x', shineX + '%');
      cert.style.setProperty('--shine-y', shineY + '%');

      // angle of shine for conic gradient
      const angleRad = Math.atan2(rx, ry);
      const angleDeg = (angleRad * 180 / Math.PI) + 90;
      cert.style.setProperty('--shine-angle', angleDeg + 'deg');
      cert.style.setProperty('--stripe-angle', (110 + ry * 30) + 'deg');

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [t.followMouse]);

  /* Drag-to-rotate ─────────────────────────────────────────────── */
  useEffect(() => {
    const cert = certRef.current;
    if (!cert) return;
    let dragging = false;
    let start = { x: 0, y: 0 };
    let baseTarget = null;

    function onDown(e) {
      if (e.target.closest('[data-no-drag]')) return;
      dragging = true;
      document.body.classList.add('dragging');
      start.x = e.clientX;
      start.y = e.clientY;
    }
    function onMove(e) {
      if (!dragging) return;
      const dx = (e.clientX - start.x) / 120;
      const dy = (e.clientY - start.y) / 120;
      const ry = Math.max(-1.4, Math.min(1.4, dx));
      const rx = Math.max(-1.4, Math.min(1.4, dy));
      cert.style.setProperty('--rx', rx.toFixed(3));
      cert.style.setProperty('--ry', ry.toFixed(3));
      const shineX = 50 + ry * 40;
      const shineY = 50 - rx * 40;
      cert.style.setProperty('--shine-x', shineX + '%');
      cert.style.setProperty('--shine-y', shineY + '%');
      const angleDeg = (Math.atan2(rx, ry) * 180 / Math.PI) + 90;
      cert.style.setProperty('--shine-angle', angleDeg + 'deg');
    }
    function onUp() {
      dragging = false;
      document.body.classList.remove('dragging');
    }

    cert.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      cert.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  /* Body class for background + toggles ────────────────────────── */
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(BG_CLASS[t.background] || 'bg-dark');
    if (!t.showFloat) document.body.classList.add('no-float');
    if (!t.showHolo)  document.body.classList.add('no-holo');
    if (!t.showShine) document.body.classList.add('no-shine');
  }, [t.background, t.showFloat, t.showHolo, t.showShine]);

  /* CSS vars for tweak intensities ─────────────────────────────── */
  useEffect(() => {
    const cert = certRef.current;
    if (!cert) return;
    cert.style.setProperty('--tilt', t.tiltMax + 'deg');
    cert.style.setProperty('--shine-strength', (t.shineStrength / 100).toFixed(2));
    cert.style.setProperty('--holo-strength', (t.holoStrength / 100).toFixed(2));
    const f = floatRef.current;
    if (f) {
      f.style.setProperty('--float-y', t.floatAmplitude + 'px');
      f.style.setProperty('--float-x', (t.floatAmplitude * 0.6) + 'px');
    }
  }, [t.tiltMax, t.shineStrength, t.holoStrength, t.floatAmplitude]);

  return (
    <React.Fragment>
      <div className="stage">
        <div className="float" ref={floatRef}>
          <div className="tilt" ref={certRef}>
            <div className="cert-3d">
              <article className="cert">

                <img
                  className="cert-watermark"
                  src="assets/logos/premium-health-icon-gold.png"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />

                {/* Frame */}
                <div className="frame-outer"></div>
                <div className="frame-inner"></div>

                {/* Corners */}
                <div className="corner tl"><CornerOrnament/></div>
                <div className="corner tr"><CornerOrnament/></div>
                <div className="corner bl"><CornerOrnament/></div>
                <div className="corner br"><CornerOrnament/></div>

                {/* Content */}
                <div className="content">
                  <header className="head">
                    <img src={(window.__resources && window.__resources.logo) || "assets/logos/horizontal-full-color.svg"} className="logo" alt="Premium Health"/>
                    <div className="head-meta">
                      <div className="seal">PH</div>
                      <div>Certificate<br/>No. {t.certificateNumber}</div>
                    </div>
                  </header>

                  <div className="award-label">Certificate of Recognition</div>
                  <h1 className="award-title">{t.awardTitle}</h1>

                  <div className="stage-text">
                    <p className="preamble">We would like to recognize</p>
                    <div className="recipient-name">{t.recipientName}</div>
                    <div className="recipient-role">{t.recipientRole}</div>
                    <p className="citation">
                      {t.citation.split(/(\*[^*]+\*)/g).map((part, i) =>
                        part.startsWith("*") && part.endsWith("*") ? (
                          <em key={i}>{part.slice(1, -1)}</em>
                        ) : (
                          <React.Fragment key={i}>{part}</React.Fragment>
                        )
                      )}
                    </p>
                  </div>

                  <div className="sigs">
                    <div className="sig">
                      <div className="sig-line"><span className="sig-script">signature</span></div>
                      <div className="sig-name">{t.signature1}</div>
                      <div className="sig-title">{t.signature1Title}</div>
                    </div>
                    <div className="sig">
                      <div className="sig-line"><span className="sig-script">signature</span></div>
                      <div className="sig-name">{t.signature2}</div>
                      <div className="sig-title">{t.signature2Title}</div>
                    </div>
                    <div className="sig">
                      <div className="sig-line"><span className="sig-script">signature</span></div>
                      <div className="sig-name">{t.signature3}</div>
                      <div className="sig-title">{t.signature3Title}</div>
                    </div>
                  </div>

                  <footer className="foot">
                    <div className="foot-meta">
                      Brooklyn, NY<br/>
                      Premium Health Medical Group
                    </div>
                    <div className="foot-date">
                      <div className="lbl">Presented</div>
                      <div className="val">{t.presentedDate}</div>
                    </div>
                    <div className="tagline">Always Premium. Always Personal.</div>
                  </footer>
                </div>

                {/* Holographic layers (above content so they tint everything) */}
                <div className="holo-base"></div>
                <div className="holo-stripes"></div>
                <div className="shine"></div>
                <div className="edge"></div>
                <div className="grain"></div>

              </article>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="download-btn"
        data-no-drag
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading ? "Exporting…" : "Download PNG"}
      </button>

      <div className="hint">Move the cursor to tilt · drag to rotate · Download PNG for a flat image</div>

      <TweaksPanel>
        <TweakSection label="Recipient"/>
        <TweakText label="Name" value={t.recipientName}
          onChange={(v) => setTweak('recipientName', v)}/>
        <TweakText label="Role" value={t.recipientRole}
          onChange={(v) => setTweak('recipientRole', v)}/>
        <TweakRadio label="Gender" value={t.gender}
          options={GENDER_OPTIONS}
          onChange={(v) => setTweak({
            gender: v,
            citation: applyGenderToCitation(t.citation, v),
          })}/>
        <TweakText label="Award title" value={t.awardTitle}
          onChange={(v) => setTweak('awardTitle', v)}/>
        <TweakText label="Certificate no." value={t.certificateNumber}
          onChange={(v) => setTweak('certificateNumber', v)}/>
        <TweakText label="Date" value={t.presentedDate}
          onChange={(v) => setTweak('presentedDate', v)}/>
        <TweakText label="Citation" value={t.citation}
          onChange={(v) => setTweak('citation', v)}/>

        <TweakSection label="Signatures"/>
        <TweakText label="Signer 1" value={t.signature1}
          onChange={(v) => setTweak('signature1', v)}/>
        <TweakText label="Signer 1 title" value={t.signature1Title}
          onChange={(v) => setTweak('signature1Title', v)}/>
        <TweakText label="Signer 2" value={t.signature2}
          onChange={(v) => setTweak('signature2', v)}/>
        <TweakText label="Signer 2 title" value={t.signature2Title}
          onChange={(v) => setTweak('signature2Title', v)}/>
        <TweakText label="Signer 3" value={t.signature3}
          onChange={(v) => setTweak('signature3', v)}/>
        <TweakText label="Signer 3 title" value={t.signature3Title}
          onChange={(v) => setTweak('signature3Title', v)}/>

        <TweakSection label="Holographic effect"/>
        <TweakSlider label="Shine intensity" value={t.shineStrength}
          min={0} max={100} unit="%"
          onChange={(v) => setTweak('shineStrength', v)}/>
        <TweakSlider label="Holographic intensity" value={t.holoStrength}
          min={0} max={100} unit="%"
          onChange={(v) => setTweak('holoStrength', v)}/>
        <TweakToggle label="Shine reflection" value={t.showShine}
          onChange={(v) => setTweak('showShine', v)}/>
        <TweakToggle label="Iridescent sheen" value={t.showHolo}
          onChange={(v) => setTweak('showHolo', v)}/>

        <TweakSection label="Motion"/>
        <TweakSlider label="Tilt angle" value={t.tiltMax}
          min={0} max={25} unit="°"
          onChange={(v) => setTweak('tiltMax', v)}/>
        <TweakSlider label="Float amplitude" value={t.floatAmplitude}
          min={0} max={24} unit="px"
          onChange={(v) => setTweak('floatAmplitude', v)}/>
        <TweakToggle label="Follow cursor" value={t.followMouse}
          onChange={(v) => setTweak('followMouse', v)}/>
        <TweakToggle label="Floating animation" value={t.showFloat}
          onChange={(v) => setTweak('showFloat', v)}/>

        <TweakSection label="Background"/>
        <TweakRadio label="Backdrop" value={t.background}
          options={BG_LABELS}
          onChange={(v) => setTweak('background', v)}/>

        <TweakSection label="Export"/>
        <TweakButton
          label={downloading ? "Exporting PNG…" : "Download certificate PNG"}
          onClick={handleDownload}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
