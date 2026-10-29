// 이음케어라이프 방문 통계 (개인정보·IP 저장 안 함)
// 사장님 본인 방문 제외: 아무 페이지 주소 뒤에 ?notrack=1 을 붙여 한 번 접속하면 이 브라우저는 집계에서 빠짐 (?notrack=0 으로 해제)
(function () {
  try {
    var URL_ = 'https://bxyekukqzmnliwmnrsdj.supabase.co/rest/v1/rpc/track_event';
    var KEY = 'sb_publishable_-lV6MyPrsE525OFMnCA6RA_tNkvgaCY';
    var q = new URLSearchParams(location.search);
    if (q.get('notrack') === '1') localStorage.setItem('ecl_notrack', '1');
    if (q.get('notrack') === '0') localStorage.removeItem('ecl_notrack');
    if (localStorage.getItem('ecl_notrack') === '1') return;
    if (navigator.webdriver || /bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent)) return;

    var rid = function () { return Math.random().toString(36).slice(2) + Date.now().toString(36); };
    var vid = localStorage.getItem('ecl_vid'); if (!vid) { vid = rid(); localStorage.setItem('ecl_vid', vid); }
    var sid = sessionStorage.getItem('ecl_sid'); if (!sid) { sid = rid(); sessionStorage.setItem('ecl_sid', sid); }
    var device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : (/iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : 'pc');
    var refHost = '';
    try { var r = document.referrer && new URL(document.referrer); if (r && r.host !== location.host) refHost = r.host; } catch (e) {}
    var utm = q.get('utm_source') || '';

    function send(event, path) {
      var body = JSON.stringify({ p_event: event, p_path: (path || location.pathname).slice(0, 300), p_ref: refHost, p_utm: utm, p_vid: vid, p_sid: sid, p_device: device });
      fetch(URL_, { method: 'POST', keepalive: true, headers: { apikey: KEY, 'content-type': 'application/json' }, body: body }).catch(function () {});
    }

    function norm() { return location.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/'; }
    var last = '';
    function view() {
      var p = norm();
      if (p === last) return; last = p; send('view', p);
      refHost = ''; // 외부 유입은 첫 페이지에만 기록
    }
    // SPA 페이지 이동 감지
    ['pushState', 'replaceState'].forEach(function (m) {
      var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); setTimeout(view, 0); return r; };
    });
    addEventListener('popstate', view);
    view();

    // 상담 전환 클릭
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a'); if (!a) return;
      var h = a.getAttribute('href') || '';
      var ev = /^tel:/.test(h) ? 'click_call' : /kakao/.test(h) ? 'click_kakao' : /\/quote/.test(h) ? 'click_quote' : /consult-form|\/contact/.test(h) ? 'click_consult' : '';
      if (ev) send(ev, norm());
    }, true);
  } catch (e) {}
})();
