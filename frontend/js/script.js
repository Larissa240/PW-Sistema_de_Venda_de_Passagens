const voos = [

{
origem:"Joinville",
destino:"São Luís",
preco:1000,
assentos:5
},

{
origem:"São Paulo",
destino:"Rio de Janeiro",
preco:350,
assentos:4
},

{
origem:"Curitiba",
destino:"Florianópolis",
preco:200,
assentos:6
},

{
origem:"São Paulo",
destino:"Salvador",
preco:850,
assentos:3
},

{
origem:"Joinville",
destino:"Brasília",
preco:700,
assentos:2
}

]


function buscarVoos(){

let origem = document.getElementById("origem").value.toLowerCase()
let destino = document.getElementById("destino").value.toLowerCase()
let lista = document.getElementById("listaVoos")

lista.innerHTML=""

voos.forEach((voo,index)=>{

if(
voo.origem.toLowerCase().includes(origem) &&
voo.destino.toLowerCase().includes(destino)
){

lista.innerHTML += `

<div class="card">

<h3>${voo.origem} ✈ ${voo.destino}</h3>

<p>Preço da passagem</p>

<h2>R$ ${voo.preco}</h2>

<p>Assentos disponíveis: ${voo.assentos}</p>

<button onclick="irConfirmacao(${index})">
Comprar Passagem
</button>

</div>

`

}

})

}



function comprar(index){

if(voos[index].assentos > 0){

voos[index].assentos--

alert("Passagem comprada com sucesso!")

buscarVoos()

}else{

alert("Voo lotado")

}

}

function irConfirmacao(index){

localStorage.setItem("vooSelecionado", JSON.stringify(voos[index]))

window.location.href = "confirmacao.html"

}

// LOGIN

const loginForm = document.getElementById("loginForm")

if(loginForm){

loginForm.addEventListener("submit", function(e){

e.preventDefault()

alert("Login realizado com sucesso!")

window.location.href = "dashboard.html"

})

}