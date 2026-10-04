/* İletişim formu – sunucuya kaydeder (SQL), sunucu yoksa mailto'ya yönlendirir */
document.addEventListener('DOMContentLoaded', () => {
  const f = document.getElementById('iletisimForm'); if (!f) return;
  const m = document.getElementById('formMsg');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = { ad: f.ad.value.trim(), eposta: f.eposta.value.trim(), mesaj: f.mesaj.value.trim() };
    if (!d.ad || !/^\S+@\S+\.\S+$/.test(d.eposta) || d.mesaj.length < 5) {
      m.className = 'msg err'; m.textContent = 'Lütfen tüm alanları doğru doldurun.'; return;
    }
    try {
      const r = await fetch('/api/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error();
      m.className = 'msg ok'; m.textContent = 'Mesajınız alındı, teşekkürler!'; f.reset();
    } catch (err) {
      location.href = `mailto:info@veripusula.example?subject=${encodeURIComponent('Web sitesi mesajı – ' + d.ad)}&body=${encodeURIComponent(d.mesaj + '\n\n' + d.eposta)}`;
      m.className = 'msg ok'; m.textContent = 'E-posta uygulamanız açılıyor…';
    }
  });
});
