const lista = document.getElementById("historico")

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatarData(dataStr) {
  if (!dataStr) return "—"
  return new Date(dataStr).toLocaleDateString("pt-BR")
}

async function carregarMinhasPassagens() {
  const token = localStorage.getItem("token")

  if (!token) {
    alert("Você precisa fazer login.")
    window.location.href = "login.html"
    return
  }

  const resposta = await fetch("/api/passagens/minhas", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })

  const passagens = await resposta.json()

  lista.innerHTML = ""

  if (passagens.length === 0) {
    lista.innerHTML = "<p>Você ainda não comprou nenhuma passagem.</p>"
    return
  }

  passagens.forEach((p) => {
    lista.innerHTML += `
      <div class="card">
        <h3>${p.origem} ✈ ${p.destino}</h3>
        <p>Data do voo: <strong>${formatarData(p.data)}</strong></p>
        <p>Passageiros: <strong>${p.num_passageiros}</strong></p>
        <p>Preço por passageiro: R$ ${formatarPreco(p.preco)}</p>
        <p>Total pago: <strong>R$ ${formatarPreco(p.valor_total || p.preco)}</strong></p>
        <p>Data da compra: ${formatarData(p.data_compra)}</p>
        <p style="color:#6a11cb;font-weight:bold;">✔ ${p.status || "Confirmado"}</p>
      </div>
    `
  })
}

carregarMinhasPassagens()