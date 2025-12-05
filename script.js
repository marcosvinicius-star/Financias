// Utilidades gerais
function formatarReal(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let usuarioAtual = null;

// Gerenciamento de usuários
function obterUsuarios(){
  return JSON.parse(localStorage.getItem('usuarios-app'))||{};
}
function salvarUsuarios(data){
  localStorage.setItem('usuarios-app', JSON.stringify(data));
}
function loginOuCadastro(usuario, senha) {
  if(!usuario||!senha) return {ok:false, msg:'Preencha usuário e senha'};
  const usuarios = obterUsuarios();
  if(!usuarios[usuario]) {
    // Cadastro automático
    usuarios[usuario] = {senha, gastos:[], limite:0, tema:'claro'};
    salvarUsuarios(usuarios);
    return {ok:true, msg:'Conta criada!'};
  } else if(usuarios[usuario].senha!==senha) {
    return {ok:false, msg:'Senha incorreta.'};
  }
  return {ok:true, msg:'Bem-vindo(a)!'};
}

function getGastosUsuario(){
  if(!usuarioAtual) return [];
  const u=obterUsuarios()[usuarioAtual]; return u?u.gastos:[];
}
function setGastosUsuario(arr){
  const users=obterUsuarios();
  users[usuarioAtual].gastos=arr;
  salvarUsuarios(users);
}

function salvarUsuarioSessao(usuario){
  localStorage.setItem('usuario-atual', usuario);
}
function obterUsuarioSessao(){
  return localStorage.getItem('usuario-atual');
}
function logout(){
  usuarioAtual=null;
  localStorage.removeItem('usuario-atual');
  document.getElementById('app-wrapper').style.display = 'none';
  document.getElementById('login-modal').style.display = 'flex';
}

// Dados globais e estado
let gastoEditandoIndice = null;
let chart = null;

function atualizarCategoriasSelect(listaGastos) {
  const select = document.getElementById('filtro-categoria');
  const categoriasUnicas = [...new Set(listaGastos.map(g => g.categoria))];
  select.innerHTML = '<option value="">Categoria</option>' + categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join('');
}

function exibirMensagemFeedback(msg, cor='#6366f1') {
  const msgElem = document.getElementById('mensagem-feedback');
  if(!msgElem) return;
  msgElem.style.color = cor;
  msgElem.textContent = msg;
  msgElem.style.display = 'block';
  setTimeout(()=>{msgElem.textContent=''; msgElem.style.display='none';},3000);
}

function atualizarLista(filtrar=true) {
  const lista = document.getElementById('expenses-list');
  const totalSpan = document.getElementById('total-mes');
  const catTop = document.getElementById('categoria-top');
  const countSpan = document.getElementById('count-gastos');

  let gastos = obterGastos();
  if(filtrar) {
    const busca = document.getElementById('busca').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const mes = document.getElementById('filtro-mes').value;
    gastos = gastos.filter(g => 
      (!busca || g.nome.toLowerCase().includes(busca)) &&
      (!categoria || g.categoria === categoria) &&
      (!mes || g.data.startsWith(mes))
    );
  }
  atualizarCategoriasSelect(obterGastos());
  lista.innerHTML = '';
  let total = 0;
  let resumoCategorias = {};
  gastos.forEach((gasto, idx) => {
    total += parseFloat(gasto.valor);
    resumoCategorias[gasto.categoria] = (resumoCategorias[gasto.categoria]||0)+parseFloat(gasto.valor);
    const item = document.createElement('div');
    item.className = 'expense-item';
    const dataFormatada = new Date(gasto.data + 'T00:00:00').toLocaleDateString('pt-BR');
    item.innerHTML = `
      <div class="expense-info">
        <strong>${gasto.nome}</strong>
        <span class="expense-value">${formatarReal(gasto.valor)}</span>
        <small>📅 ${dataFormatada} • 🏷️ ${gasto.categoria}</small>
      </div>
      <div class="expense-actions">
        <button class="btn-edit" onclick="editarGasto(${idx})" title="Editar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M10.5 3L15 7.5M12 1.5L14.25 3.75L10.5 7.5L8.25 5.25L12 1.5ZM3 15V12L9.75 5.25L12 7.5L5.25 14.25H3V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-delete" onclick="removerGasto(${idx})" title="Excluir">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.75 4.5H14.25M6.75 4.5V3C6.75 2.60218 6.90804 2.22064 7.18934 1.93934C7.47064 1.65804 7.85218 1.5 8.25 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V4.5M13.5 4.5V15C13.5 15.3978 13.342 15.7794 13.0607 16.0607C12.7794 16.342 12.3978 16.5 12 16.5H6C5.60218 16.5 5.22064 16.342 4.93934 16.0607C4.65804 15.7794 4.5 15.3978 4.5 15V4.5H13.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    lista.appendChild(item);
  });
  totalSpan.textContent = formatarReal(total);
  countSpan.textContent = gastos.length;
  const expensesCount = document.getElementById('expenses-count');
  if(expensesCount) expensesCount.textContent = gastos.length;
  const [cat, val] = Object.entries(resumoCategorias).sort(([,a],[,b])=>b-a)[0]||['-',0];
  catTop.textContent = cat+ (val? ' ('+formatarReal(val)+')':'');
  renderizarGrafico(resumoCategorias);
}

function removerGasto(idx) {
  if(!confirm('Confirma excluir este gasto?')) return;
  const gastos = obterGastos();
  const busca = document.getElementById('busca').value.toLowerCase();
  const categoria = document.getElementById('filtro-categoria').value;
  const mes = document.getElementById('filtro-mes').value;
  let gastosFiltrados = gastos.filter(g => 
    (!busca || g.nome.toLowerCase().includes(busca)) &&
    (!categoria || g.categoria === categoria) &&
    (!mes || g.data.startsWith(mes))
  );
  const gastoRemover = gastosFiltrados[idx];
  const indiceReal = gastos.findIndex(g => g === gastoRemover);
  if(indiceReal !== -1) {
    gastos.splice(indiceReal, 1);
    salvarGastos(gastos);
    exibirMensagemFeedback('Gasto removido com sucesso!','#ef4444');
    atualizarLista();
  }
}

function editarGasto(idx) {
  const gastos = obterGastos();
  const busca = document.getElementById('busca').value.toLowerCase();
  const categoria = document.getElementById('filtro-categoria').value;
  const mes = document.getElementById('filtro-mes').value;
  let gastosFiltrados = gastos.filter(g => 
    (!busca || g.nome.toLowerCase().includes(busca)) &&
    (!categoria || g.categoria === categoria) &&
    (!mes || g.data.startsWith(mes))
  );
  const g = gastosFiltrados[idx];
  const indiceReal = gastos.findIndex(gt => gt === g);
  document.getElementById('name').value = g.nome;
  document.getElementById('amount').value = g.valor;
  document.getElementById('date').value = g.data;
  document.getElementById('category').value = g.categoria;
  gastoEditandoIndice = indiceReal;
  exibirMensagemFeedback('Editando gasto... Preencha os campos e clique em Adicionar Gasto','#6366f1');
  document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Submissão do formulário: novo ou editar
const form = document.getElementById('expense-form');
form.onsubmit = function(e) {
  e.preventDefault();
  const nome = document.getElementById('name').value.trim();
  const valor = document.getElementById('amount').value;
  const data = document.getElementById('date').value;
  const categoria = document.getElementById('category').value.trim()||'Outros';
  if(!nome || !valor || !data) return exibirMensagemFeedback('Preencha todos os campos!','#ef4444');
  const novoGasto = {nome, valor, data, categoria};
  let gastos = obterGastos();
  if(gastoEditandoIndice!==null) {
    gastos[gastoEditandoIndice]=novoGasto;
    gastoEditandoIndice=null;
    exibirMensagemFeedback('✅ Gasto atualizado com sucesso!','#10b981');
  } else {
    gastos.push(novoGasto);
    exibirMensagemFeedback('✅ Gasto adicionado com sucesso!','#10b981');
  }
  salvarGastos(gastos);
  form.reset();
  atualizarLista();
};

// Filtros & exportação
['busca', 'filtro-categoria','filtro-mes'].forEach(id=>{
  document.getElementById(id).oninput=()=>atualizarLista();
});
document.getElementById('limpar-filtros').onclick=function(){
  document.getElementById('busca').value='';
  document.getElementById('filtro-categoria').value='';
  document.getElementById('filtro-mes').value='';
  atualizarLista();
};
document.getElementById('exportar-csv').onclick = function() {
  const gastos = obterGastos();
  if(!gastos.length) return exibirMensagemFeedback('Sem dados para exportar!','#ef4444');
  const cab = 'Nome,Valor,Data,Categoria\n';
  const linhas = gastos.map(g=>`${g.nome},${g.valor},${g.data},${g.categoria}`).join('\n');
  const blob = new Blob([cab+linhas], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gastos.csv';
  a.click();
  URL.revokeObjectURL(url);
  exibirMensagemFeedback('✅ CSV exportado com sucesso!','#10b981');
}

// Gráfico de pizza por categoria
function renderizarGrafico(resumoCategorias) {
  if(!document.getElementById('grafico-categorias')) return;
  const ctx = document.getElementById('grafico-categorias').getContext('2d');
  const labels = Object.keys(resumoCategorias);
  const values = Object.values(resumoCategorias);
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'pie',
    data: {labels, datasets: [{data: values, backgroundColor:[
      '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'
    ]}]},
    options: {
      plugins: {
        legend:{position:'bottom'},
        title:{display:true, text:'Gastos por Categoria'}
      }
    }
  });
}

// Login
window.onload = function(){
  usuarioAtual = obterUsuarioSessao();
  if(usuarioAtual){
    document.getElementById('login-modal').style.display='none';
    document.getElementById('app-wrapper').style.display = 'flex';
    const userElem = document.getElementById('usuario-logado');
    const userInicial = document.getElementById('usuario-inicial');
    if(userElem) userElem.textContent = usuarioAtual;
    if(userInicial) userInicial.textContent = usuarioAtual.charAt(0).toUpperCase();
    atualizarLista(false);
  } else {
    document.getElementById('login-modal').style.display='flex';
    document.getElementById('app-wrapper').style.display = 'none';
  }
};

document.getElementById('login-form').onsubmit=function(e){
  e.preventDefault();
  const usuario = document.getElementById('login-usuario').value.trim();
  const senha = document.getElementById('login-senha').value;
  const res = loginOuCadastro(usuario,senha);
  const msgElem = document.getElementById('login-msg');
  if(msgElem) {
    msgElem.textContent = res.msg;
    msgElem.style.color = res.ok?'#10b981':'#ef4444';
    msgElem.style.background = res.ok?'rgba(16, 185, 129, 0.1)':'rgba(239, 68, 68, 0.1)';
    msgElem.style.padding = '0.75rem 1rem';
    msgElem.style.borderRadius = '0.5rem';
    msgElem.style.marginTop = '1rem';
  }
  if(res.ok) {
    setTimeout(() => {
      usuarioAtual = usuario;
      salvarUsuarioSessao(usuario);
      document.getElementById('login-modal').style.display = 'none';
      document.getElementById('app-wrapper').style.display = 'flex';
      const userElem = document.getElementById('usuario-logado');
      const userInicial = document.getElementById('usuario-inicial');
      if(userElem) userElem.textContent = usuario;
      if(userInicial) userInicial.textContent = usuario.charAt(0).toUpperCase();
      atualizarLista(false);
    }, 500);
  }
};
document.getElementById('logout-btn').onclick=logout;

function obterGastos() {
  return getGastosUsuario();
}

function salvarGastos(gastos) {
  setGastosUsuario(gastos);
}
