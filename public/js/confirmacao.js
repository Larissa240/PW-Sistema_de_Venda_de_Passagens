const vooSelecionado = JSON.parse(localStorage.getItem("vooSelecionado"))
const dados = document.getElementById("dadosVoo")

function formatarPreco(valor){
  return Number(valor).toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2})
}

function formatarData(dataStr){
  if(!dataStr) return "—"
  const partes = dataStr.split("-")
  if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`
  return dataStr
}

// Lê assentos reais (já com descontos anteriores desta sessão)
function getAssentosAtuais(){
  const assentosPorVoo = JSON.parse(sessionStorage.getItem("assentosPorVoo")) || {}
  const key = `${vooSelecionado.origem}-${vooSelecionado.destino}`
  return assentosPorVoo[key] !== undefined ? assentosPorVoo[key] : vooSelecionado.assentos
}

if(vooSelecionado){

  const labelPassageiros = vooSelecionado.numPassageiros > 1
    ? `${vooSelecionado.numPassageiros} passageiros`
    : `1 passageiro`

  const assentosAtuais = getAssentosAtuais()

  dados.innerHTML = `

<p><strong>Origem:</strong> ${vooSelecionado.origem}</p>

<p><strong>Destino:</strong> ${vooSelecionado.destino}</p>

<p><strong>Data do voo:</strong> ${formatarData(vooSelecionado.dataVoo)}</p>

<p><strong>Passageiros:</strong> ${labelPassageiros}</p>

<p><strong>Preço por passageiro:</strong> R$ ${formatarPreco(vooSelecionado.precoPorPassageiro)}</p>

<p><strong>Total a pagar:</strong> <span style="font-size:20px;color:#6a11cb;font-weight:bold;">R$ ${formatarPreco(vooSelecionado.precoTotal)}</span></p>

<p><strong>Assentos disponíveis:</strong> ${assentosAtuais}</p>

<hr style="margin:15px 0;border:none;border-top:1px solid #eee;">

`

}else{

  dados.innerHTML = "<p>Nenhum voo selecionado. <a href='index.html'>Voltar</a></p>"

}

async function confirmarCompra() {

  if (!vooSelecionado) {
    alert("Nenhum voo selecionado.")
    return
  }

  const token = localStorage.getItem("token")

  if (!token) {
    alert("Você precisa fazer login para comprar.")
    window.location.href = "login.html"
    return
  }

  const resposta = await fetch("/api/passagens/comprar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      voo_id: vooSelecionado.voo_id,
      num_passageiros: vooSelecionado.numPassageiros
    })
  })

  const data = await resposta.json()

  if (!resposta.ok) {
    alert(data.message || "Erro ao comprar passagem.")
    return
  }

  localStorage.removeItem("vooSelecionado")

  alert("Compra confirmada com sucesso!")
  window.location.href = "minhas-passagens.html"
}
