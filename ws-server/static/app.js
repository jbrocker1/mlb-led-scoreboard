const logEl = document.getElementById('log');
const listEl = document.getElementById('wifi-list');
const promptEl = document.getElementById('password-prompt');
const promptOverlayEl = document.getElementById('popupOverlay');
const selectedEl = document.getElementById('selected-ssid');
const pwdInput	 = document.getElementById('password');
const connectBtn = document.getElementById('connect-btn');
const clearLogBtn = document.getElementById('clear-log-btn');
let selectedSSID = null;
let ws;
let reconnectInterval = 1000;

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
		promptOverlayEl.style.display='block';
		pwdInput.focus();
	};
	listEl.appendChild(btn);
  });
}

// Defining buton on press
connectBtn.onclick = ()=>{
	const pwd = pwdInput.value.trim();

	if(!selectedSSID||!pwd) return log('Select SSID + enter password');
	const payload = {type:'connect', ssid:selectedSSID, password:pwd};
	ws.send(JSON.stringify(payload));

	log(`→ asking to connect to "${selectedSSID}"`);
	promptEl.style.display='none';
	promptOverlayEl.style.display='none';
	pwdInput.value='';
};

// Clears the log
clearLogBtn.onclick = ()=>{
	logEl.innerHTML = "Log Cleared";
};

promptOverlayEl.onclick = ()=> {
	promptEl.style.display='none';
	promptOverlayEl.style.display='none';
	pwdInput.value='';
}




function connectWebSocket() {
	log('Attempting to connect to websocket');
	ws = new WebSocket(`ws://${location.hostname}:6789`);

	// open WS
	ws.onopen = ()=>{
	  log('WS connected — requesting networks');
	  ws.send(JSON.stringify({type:'list_networks'}));
	  log('Requesting previous connection response.');
	  ws.send(JSON.stringify({type:'get_prev_connect_result'}));
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
		case 'prev_connect_result':
			log(`← Previous connection result ${msg.status}: ${msg.output}`);
			break;
		case 'error':
		  log(`← Error: ${msg.received||msg.bad_json}`);
		  break;
	  }
	};

	ws.onclose = ()=> {
		log('WS closed. You may need to reconnect to the "LightBoard" WiFi and refresh/reopen this webpage.');
		setTimeout(connectWebSocket, reconnectInterval);
	}

}


// Running the websocket
connectWebSocket();
