// Türkiye Afet Haritası · Bilgi yarışması ve sertifika
'use strict';

// ------------------------------------------------------------------ bilgi yarışması
function quizStart() {
  const name = S.q ? S.q.name : "";
  S.q = { i: 0, score: 0, done: false, ans: null, name, order: QUIZ.map(q => q.a ? shuffle(q.a.map((_, j) => j)) : null) };
  clearQuizMarks();
  quizPrep();
}
function quizValid(q) {
  if (Array.isArray(q.map)) return q.map;
  if (q.map === "kaf") return faultProvs("kaf");
  if (q.map === "cig3") return GEO.prov.filter(p => RISK[p.id][3] === 3).map(p => p.id);
  if (q.map === "ege3") return GEO.prov.filter(p => REGION[p.id] === "E" && RISK[p.id][0] === 3).map(p => p.id);
  return [];
}
function clearQuizMarks() { for (const id in provEl) provEl[id].classList.remove("q-ok", "q-bad", "q-ans"); }
function quizPrep() {
  clearQuizMarks();
  const q = QUIZ[S.q.i];
  svg.classList.toggle("q-faults", !!(q && q.faults));
  if (q && q.map) showToast(`${ic("pin")} Haritada bir ile dokun!`, { q: true }); else hideToast();
}
function quizAnswer(j) {
  const q = QUIZ[S.q.i];
  if (!q || !q.a || S.q.ans != null) return;
  S.q.ans = j;
  if (j === 0) S.q.score++;
  renderPanel();
}
function quizMapAnswer(id) {
  const q = QUIZ[S.q.i];
  if (!q || !q.map || S.q.ans != null) return;
  const valid = quizValid(q), ok = valid.includes(id);
  S.q.ans = id;
  if (ok) S.q.score++;
  valid.forEach(v => provEl[v].classList.add("q-ans"));
  provEl[id].classList.add(ok ? "q-ok" : "q-bad");
  hideToast();
  renderPanel();
  if (!WIDE.matches) showToast(`${ok ? "Doğru!" : "Yanlış."} <button class="tlink" data-act="to-panel">Açıklamayı gör</button>`, { ms: 6000 });
}
function quizNext() {
  S.q.i++; S.q.ans = null;
  if (S.q.i >= QUIZ.length) { S.q.done = true; clearQuizMarks(); hideToast(); svg.classList.remove("q-faults"); }
  else quizPrep();
  renderPanel();
  if (!WIDE.matches) panel.scrollIntoView({ behavior: RM.matches ? "auto" : "smooth", block: "start" });
}
function viewQuiz() {
  const Q = S.q;
  if (Q.done) return quizResult();
  const q = QUIZ[Q.i], n = QUIZ.length;
  let html = `<div class="eyebrow" style="--c:var(--ink-2)">${ic("quiz")} Bilgi Yarışması</div>
<div class="qprog"><i style="width:${(Q.i / n * 100).toFixed(1)}%"></i></div>
<div class="qmeta"><span>Soru ${Q.i + 1} / ${n}</span><span>Puan: ${Q.score}</span></div><p class="qq">${q.q}</p>`;
  if (q.a) {
    html += `<div class="qopts">${Q.order[Q.i].map((j, p) => {
      const st = Q.ans == null ? "" : j === 0 ? " ok" : j === Q.ans ? " bad" : "";
      return `<button class="qopt${st}" data-act="qa" data-i="${j}"${Q.ans != null ? " disabled" : ""}><span class="k">${"ABCD"[p]}</span><span>${q.a[j]}</span></button>`;
    }).join("")}</div>`;
  } else if (Q.ans == null) {
    html += `<div class="qmap">${ic("pin")}<span>Haritada bir ile dokun.${q.hint ? `<br><small>${q.hint}</small>` : ""}</span></div>`;
  }
  if (Q.ans != null) {
    const ok = q.a ? Q.ans === 0 : quizValid(q).includes(Q.ans);
    const pre = q.map ? (ok ? `${PROV[Q.ans].n} doğru! ` : `Dokunduğun il: ${PROV[Q.ans].n}. Doğru cevaplar haritada yeşille gösterildi. `) : "";
    html += `<div class="qfb ${ok ? "ok" : "bad"}"><b>${ok ? "Doğru!" : "Yanlış."}</b>${pre}${q.ex}</div>
<div class="row"><button class="btn btn-primary" data-act="qn">${Q.i + 1 < n ? "Sonraki soru" : "Sonucu gör"} ${ic("next")}</button></div>`;
  }
  return html;
}
const rankOf = sc => RANKS.find(([m]) => sc >= m * QUIZ.length);
function quizResult() {
  const sc = S.q.score, n = QUIZ.length, [, rank, msg] = rankOf(sc);
  return `<div class="qres"><div class="eyebrow" style="--c:var(--ink-2)">${ic("award")} Yarışma bitti</div>
<div class="score">${sc} / ${n}</div><span class="rank">${ic("award")} ${rank}</span>
<p style="margin-top:.9rem">${msg}</p>
<div class="field"><label for="certName">Sertifikada yazacak adın</label><input id="certName" maxlength="40" autocomplete="off" placeholder="Adın ve soyadın" value="${esc(S.q.name)}"></div>
<div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="cert">${ic("award")} Sertifikamı göster</button><button class="btn" data-act="qr">Yeniden oyna</button></div></div>`;
}
function showCert() {
  const inp = $("#certName");
  if (inp) S.q.name = inp.value.trim();
  const sc = S.q.score, n = QUIZ.length;
  const date = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const canPrint = window.top === window.self;
  openModal("Afet Bilinci Sertifikası", `<div class="cert" id="certPrint"><div class="t1">Türkiye Afet Haritası</div><h3>Afet Bilinci Sertifikası</h3>
<p>Bu sertifika,</p><div class="who">${esc(S.q.name || "Afet Bilinci Kahramanı")}</div>
<p>adlı öğrencinin Türkiye Afet Haritası Bilgi Yarışması'nda ${n} sorunun ${sc} tanesini doğru cevaplayarak aşağıdaki unvanı kazandığını gösterir.</p>
<span class="rank">${rankOf(sc)[1]}</span>
<div class="sig"><div>Tarih<br><b>${date}</b></div><div>Hazırlayan<br><span class="name">Hakan Er</span><br>Sosyal Bilgiler Öğretmeni</div></div></div>
${canPrint ? `<div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="print">Yazdır</button></div>` : `<p class="note" style="text-align:center">Sertifikanı saklamak için ekran görüntüsü alabilirsin.</p>`}`);
}
