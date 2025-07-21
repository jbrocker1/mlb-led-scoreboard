const logEl = document.getElementById('log');
const listEl = document.getElementById('wifi-list');
const promptEl = document.getElementById('password-prompt');
const selectedEl = document.getElementById('selected-ssid');
const pwdInput   = document.getElementById('password');
const connectBtn = document.getElementById('connect-btn');
let selectedSSID = null;

// append to log
function log(msg){ logEl.textContent += msg+"\n" }

// build buttons from SSID list
function buildList(ssids){
  listEl.innerHTML = '';
  ssids.forEach(ssid=>{
    const btn = document.createElement('button');
    btn.textContent = ssid;
    btn.onclick = ()=>{
      selectedSSID=ssid;
      selectedEl.textContent=`Connect to "${ssid}"`;
      promptEl.style.display='block';
      pwdInput.focus();
    };
    listEl.appendChild(btn);
  });
}

// open WS
const ws = new WebSocket(`ws://${location.hostname}:6789`);
ws.onopen = ()=>{
  log('WS connected — requesting networks');
  ws.send(JSON.stringify({type:'list_networks'}));
};
ws.onmessage = evt=>{
  const msg = JSON.parse(evt.data);
  switch(msg.type){
    case 'networks':
      log(`← got ${msg.ssids.length} networks`);
      buildList(msg.ssids);
      break;
    case 'connect_result':
      log(`← Connect ${msg.status}: ${msg.output}`);
      break;
    case 'error':
      log(`← Error: ${msg.received||msg.bad_json}`);
      break;
  }
};
ws.onclose = ()=> log('WS closed');

connectBtn.onclick = ()=>{
  const pwd = pwdInput.value.trim();
  if(!selectedSSID||!pwd) return log('Select SSID + enter password');
  const payload = {type:'connect', ssid:selectedSSID, password:pwd};
  ws.send(JSON.stringify(payload));
  log(`→ asking to connect to "${selectedSSID}"`);
  promptEl.style.display='none';
  pwdInput.value='';
};

