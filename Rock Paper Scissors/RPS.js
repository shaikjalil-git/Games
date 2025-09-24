(function(){
      const buttons = document.querySelectorAll('.btn');
      const playerPickEl = document.getElementById('playerPick');
      const computerPickEl = document.getElementById('computerPick');
      const resultMsg = document.getElementById('resultMsg');
      const winsEl = document.getElementById('wins');
      const lossesEl = document.getElementById('losses');
      const tiesEl = document.getElementById('ties');
      const totalEl = document.getElementById('total');
      const streakEl = document.getElementById('streak');
      const historyList = document.getElementById('historyList');
      const undoBtn = document.getElementById('undoBtn');
      const resetBtn = document.getElementById('resetBtn');
      const autoPlayBtn = document.getElementById('autoPlayBtn');

      const MOVES = {
        rock: {emoji:'✊'},
        paper: {emoji:'✋'},
        scissors: {emoji:'✌️'}
      };

      let state = {
        wins:0, losses:0, ties:0, streak:0, total:0, history:[]
      };

      const STORAGE_KEY = 'rps_state_v1';

      function save(){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
      function load(){
        try{
          const raw = localStorage.getItem(STORAGE_KEY);
          if(raw) state = JSON.parse(raw);
        }catch(e){}
      }

      function render(){
        winsEl.textContent = state.wins;
        lossesEl.textContent = state.losses;
        tiesEl.textContent = state.ties;
        totalEl.textContent = state.total;
        streakEl.textContent = state.streak;
        historyList.innerHTML = '';
        state.history.slice().reverse().forEach(entry => {
          const div = document.createElement('div');
          div.className = 'history-item ' + entry.result;
          div.innerHTML = '<div style="width:38px;text-align:center;font-size:20px">'+ (MOVES[entry.player].emoji) +'</div>'
                        + '<div style="flex:1"><div style="font-weight:600">'+ capitalize(entry.player) +' → '+ capitalize(entry.computer) +'</div>'
                        + '<div style="font-size:12px;color:var(--muted)">'+ entry.result.toUpperCase() + (entry.date ? ' • '+entry.date : '') +'</div></div>';
          historyList.appendChild(div);
        });
      }

      function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1) }

      function getComputerChoice(){
        const keys = Object.keys(MOVES);
        return keys[Math.floor(Math.random()*keys.length)];
      }

      function decide(player, comp){
        if(player === comp) return 'tie';
        if((player==='rock' && comp==='scissors') ||
           (player==='scissors' && comp==='paper') ||
           (player==='paper' && comp==='rock')) return 'win';
        return 'loss';
      }

      function flash(el){
        el.classList.add('flash');
        setTimeout(()=>el.classList.remove('flash'), 250);
      }

      function playRound(player){
        const comp = getComputerChoice();
        const result = decide(player, comp);
        const date = new Date().toLocaleTimeString();
        state.total++;
        if(result==='win'){ state.wins++; state.streak = Math.max(1, state.streak+1); }
        else if(result==='loss'){ state.losses++; state.streak = Math.min(-1, state.streak-1); }
        else { state.ties++; state.streak = 0; }
        state.history.push({player, computer:comp, result, date});
        save();
       
        playerPickEl.textContent = MOVES[player].emoji;
        computerPickEl.textContent = MOVES[comp].emoji;
        resultMsg.textContent = result === 'win' ? 'You win 🎉' : result === 'loss' ? 'You lose 💔' : 'Tie 🤝';
        
        if(result==='win'){ resultMsg.style.color = 'var(--win)'; }
        else if(result==='loss'){ resultMsg.style.color = 'var(--lose)'; }
        else { resultMsg.style.color = 'var(--tie)'; }
        flash(resultMsg);
        render();
      }

      buttons.forEach(btn=>{
        btn.addEventListener('click', ()=> {
          const move = btn.dataset.move;
          playRound(move);
        });
      });

      undoBtn.addEventListener('click', ()=>{
        const last = state.history.pop();
        if(!last) return;
        
        state.total = Math.max(0, state.total-1);
        if(last.result==='win') state.wins = Math.max(0, state.wins-1);
        if(last.result==='loss') state.losses = Math.max(0, state.losses-1);
        if(last.result==='tie') state.ties = Math.max(0, state.ties-1);
        
        let s = 0;
        for(let i=state.history.length-1;i>=0;i--){
          const r = state.history[i].result;
          if(r==='win') s = s>0 ? s+1 : 1;
          else if(r==='loss') s = s<0 ? s-1 : -1;
          else { s = 0; break; }
        }
        state.streak = s;
        save(); render();
      });

      resetBtn.addEventListener('click', ()=>{
        if(!confirm('Reset all scores and history?')) return;
        state = {wins:0, losses:0, ties:0, streak:0, total:0, history:[]};
        save(); render();
        playerPickEl.textContent = '—'; computerPickEl.textContent='—';
        resultMsg.textContent = 'Make your move'; resultMsg.style.color='';
      });

      autoPlayBtn.addEventListener('click', async ()=>{
        autoPlayBtn.disabled = true;
        const rounds = 10;
        for(let i=0;i<rounds;i++){
          const move = Object.keys(MOVES)[Math.floor(Math.random()*3)];
          playRound(move);
          await new Promise(r=>setTimeout(r, 260));
        }
        autoPlayBtn.disabled = false;
      });

      
      window.addEventListener('keydown', (e)=>{
        if(e.key.toLowerCase() === 'r') playRound('rock');
        if(e.key.toLowerCase() === 'p') playRound('paper');
        if(e.key.toLowerCase() === 's') playRound('scissors');
        if(e.key === 'u') undoBtn.click();
      });

      
      load();
      render();
    })();