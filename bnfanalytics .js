/* ================================================================
   BNF GAMES — Rastreamento (pageviews + "online agora")
   Inclua no final do <body>, depois do bnf-config.js:

   <script src="./bnf-config.js"></script>
   <script src="./bnf-analytics.js" data-page="Home"></script>

   Não precisa mexer neste arquivo — a config fica no bnf-config.js.
================================================================= */
(function(){
  var scriptTag = document.currentScript;
  var pageName = (scriptTag && scriptTag.getAttribute('data-page')) || document.title || location.pathname;

  var URL_CFG = window.BNF_SUPABASE_URL;
  var KEY_CFG = window.BNF_SUPABASE_ANON_KEY;

  if(!URL_CFG || !KEY_CFG || URL_CFG.indexOf('COLE_AQUI') === 0){
    return; // Supabase ainda não configurado — não faz nada, não quebra a página
  }

  function getSessionId(){
    var k = 'bnf_session_id';
    var id = localStorage.getItem(k);
    if(!id){
      id = 'sx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(k, id);
    }
    return id;
  }

  function loadSupabaseLib(cb){
    if(window.supabase && window.supabase.createClient){ cb(); return; }
    var existing = document.querySelector('script[data-bnf-supabase-lib]');
    if(existing){ existing.addEventListener('load', cb); return; }
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/@supabase/supabase-js@2';
    s.setAttribute('data-bnf-supabase-lib', '1');
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadSupabaseLib(function(){
    try{
      var sb = window.supabase.createClient(URL_CFG, KEY_CFG);
      var sessionId = getSessionId();

      // log de visualização (uma linha por carregamento de página)
      sb.from('bnf_pageviews').insert({
        session_id: sessionId,
        page: pageName,
        referrer: document.referrer || null
      }).then(function(){});

      // presença / heartbeat (upsert — mostra quem está online agora)
      function heartbeat(){
        sb.from('bnf_sessions').upsert({
          session_id: sessionId,
          page: pageName,
          last_seen: new Date().toISOString()
        }, { onConflict: 'session_id' }).then(function(){});
      }
      heartbeat();
      var timer = setInterval(heartbeat, 25000);
      window.addEventListener('beforeunload', function(){
        clearInterval(timer);
        heartbeat();
      });
    }catch(e){
      // silencioso — analytics nunca deve quebrar o jogo
    }
  });
})();
