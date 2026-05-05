const vooSelecionado = JSON.parse(localStorage.getItem("vooSelecionado"))

const dados = document.getElementById("dadosVoo")

if(vooSelecionado){

dados.innerHTML = `

<p><strong>Origem:</strong> ${vooSelecionado.origem}</p>

<p><strong>Destino:</strong> ${vooSelecionado.destino}</p>

<p><strong>Preço:</strong> R$ ${vooSelecionado.preco}</p>

<p><strong>Assentos disponíveis:</strong> ${vooSelecionado.assentos}</p>

`

}

function confirmarCompra(){

let passagens = JSON.parse(localStorage.getItem("passagens")) || []

passagens.push(vooSelecionado)

localStorage.setItem("passagens", JSON.stringify(passagens))

alert("Compra confirmada com sucesso!")

window.location.href = "minhas-passagens.html"

}