const historico = JSON.parse(localStorage.getItem("passagens")) || []

const lista = document.getElementById("historico")

if(historico.length === 0){

lista.innerHTML = "<p>Você ainda não comprou nenhuma passagem.</p>"

}else{

historico.forEach((voo)=>{

lista.innerHTML += `

<div class="card">

<h3>${voo.origem} ✈ ${voo.destino}</h3>

<p>Preço pago: R$ ${voo.preco}</p>

<p>Status: Confirmado</p>

</div>

`

})

}