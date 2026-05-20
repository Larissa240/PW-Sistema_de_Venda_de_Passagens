let voos = []

async function carregarVoos() {

  const resposta = await fetch("/api/voos")

  voos = await resposta.json()

}

window.addEventListener("DOMContentLoaded", carregarVoos)


// Lê os assentos decrementados por compras anteriores nesta sessão
function getAssentosDisponiveis(voo){
  const assentosPorVoo = JSON.parse(sessionStorage.getItem("assentosPorVoo")) || {}
  const key = `${voo.origem}-${voo.destino}`

  return assentosPorVoo[key] !== undefined 
    ? assentosPorVoo[key] 
    : voo.assentos_disponiveis
}

// Preenche a data com a data de hoje ao carregar a página
window.addEventListener("DOMContentLoaded", function(){
  const campoData = document.getElementById("data")
  if(campoData){
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = String(hoje.getMonth()+1).padStart(2,"0")
    const dia = String(hoje.getDate()).padStart(2,"0")
    campoData.value = `${ano}-${mes}-${dia}`
    campoData.min = `${ano}-${mes}-${dia}`
  }

  // Recalcula os cards quando muda o número de passageiros
  const selectPassageiros = document.getElementById("passageiros")
  if(selectPassageiros){
    selectPassageiros.addEventListener("change", function(){
      const listaVoos = document.getElementById("listaVoos")
      if(listaVoos && listaVoos.innerHTML.trim() !== ""){
        buscarVoos()
      }
    })
  }
})

function getNumPassageiros(){
  const sel = document.getElementById("passageiros")
  if(!sel) return 1
  return parseInt(sel.value)
}

function formatarPreco(valor){
  return valor.toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2})
}

function buscarVoos(){

let origem = document.getElementById("origem").value.toLowerCase()
let destino = document.getElementById("destino").value.toLowerCase()
let numPassageiros = getNumPassageiros()
let lista = document.getElementById("listaVoos")

lista.innerHTML=""

let encontrou = false

voos.forEach((voo, index)=>{

const dataSelecionada = document.getElementById("data").value

const dataVoo = voo.data ? voo.data.substring(0, 10) : ""

if(
  voo.origem.toLowerCase().includes(origem) &&
  voo.destino.toLowerCase().includes(destino) &&
  dataVoo === dataSelecionada
){

let dataSelecionada = document.getElementById("data").value

encontrou = true
const assentosAtuais = getAssentosDisponiveis(voo)
const precoTotal = voo.preco * numPassageiros
const labelPassageiros = numPassageiros > 1 ? `${numPassageiros} passageiros` : `1 passageiro`
const semAssentos = assentosAtuais <= 0

lista.innerHTML += `

<div class="card">

<h3>${voo.origem} ✈ ${voo.destino}</h3>

<p>Preço por passageiro</p>
<p style="font-size:13px;color:#888;">R$ ${formatarPreco(voo.preco)}</p>

<p style="margin-top:8px;font-size:13px;">Total (${labelPassageiros})</p>
<h2>R$ ${formatarPreco(precoTotal)}</h2>

<p>Assentos disponíveis: <strong>${assentosAtuais}</strong></p>

<button onclick="irConfirmacao(${index})" ${semAssentos ? 'disabled style="background:#aaa;cursor:not-allowed;"' : ''}>
${semAssentos ? 'Voo Lotado' : 'Comprar Passagem'}
</button>

</div>

`

}

})

if(!encontrou && (origem || destino)){
  lista.innerHTML = "<p style='color:#666;margin-top:20px;'>Nenhum voo encontrado para esta rota.</p>"
}

}

function irConfirmacao(index){

  const numPassageiros = getNumPassageiros()
  const voo = voos[index]
  const assentosAtuais = getAssentosDisponiveis(voo)

  const campoData = document.getElementById("data")
  const dataSelecionada = campoData ? campoData.value : ""

  if (!dataSelecionada) {
    alert("Selecione a data do voo.")
    return
  }

  const vooParaSalvar = {
    voo_id: voo.id,
    origem: voo.origem,
    destino: voo.destino,
    precoPorPassageiro: voo.preco,
    precoTotal: voo.preco * numPassageiros,
    numPassageiros: numPassageiros,
    assentos: assentosAtuais,
    dataVoo: dataSelecionada
  }

  localStorage.setItem("vooSelecionado", JSON.stringify(vooParaSalvar))

  window.location.href = "confirmacao.html"
}


// LOGIN

const loginForm = document.getElementById("loginForm")

if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    const resposta = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    })

    const data = await resposta.json()

    if (!resposta.ok) {
      alert(data.message)
      return
    }

    localStorage.setItem("token", data.token)
    localStorage.setItem("usuario", JSON.stringify(data.user))

    window.location.href = "dashboard.html"
  })
}

// CADASTRO
const cadastroForm = document.getElementById("cadastroForm")

if (cadastroForm) {

  cadastroForm.addEventListener("submit", async function(e) {

    e.preventDefault()

    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    try {

      const response = await fetch("/api/usuarios/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          senha
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      alert("Cadastro realizado com sucesso!")

      window.location.href = "login.html"

    } catch (error) {

      console.error("Erro ao cadastrar:", error)

      alert("Erro ao conectar com o servidor.")

    }

  })

}