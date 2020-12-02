const botaoConectar     = document.getElementById('botaoConectar');
const botaoDesconectar  = document.getElementById('botaoDesconectar')
const ctx 				= document.getElementById('grafico').getContext('2d');
let dadosGrafico        = [];

document.getElementById('btn_menu').onclick = () => {
	let elemento = document.getElementById('menu');
	elemento.classList.toggle("hidden");
}

document.getElementById('menuLinear').onclick = () => {
	let subMenuLinear = document.getElementById('subMenuLinear');
	subMenuLinear.classList.remove("hidden");
	let menuLinearSair = document.getElementById('menuLinearSair');
	menuLinearSair.classList.remove("hidden");
}

document.getElementById('menuLinearSair').onclick = () => {
	let subMenuLinear = document.getElementById('subMenuLinear');
	subMenuLinear.classList.add("hidden");
	let menuLinearSair = document.getElementById('menuLinearSair');
	menuLinearSair.classList.add("hidden");
}

document.getElementById('subMenuLinear').onclick = () => {
	let subMenuLinear = document.getElementById('subMenuLinear');
	subMenuLinear.classList.add("hidden");
	let menuLinearSair = document.getElementById('menuLinearSair');
	menuLinearSair.classList.add("hidden");
}


window.onload = () => {
	botaoConectar.style.display = 'initial';
	botaoDesconectar.style.display = 'none';
}

//BLE
let servicoUuid        	= 0xBEEF;
let caracteristicaUuid 	= 0xFEED;

let dispositivo, caracteristica;

botaoConectar.onclick = async () => {  

    dispositivo = await navigator.bluetooth
	.requestDevice({ 
		filters: [{ 
			services: [servicoUuid] 
		}] 
	});

    const servidor = await dispositivo.gatt.connect();
    const servico = await servidor.getPrimaryService(servicoUuid);
    caracteristica = await servico.getCharacteristic(caracteristicaUuid);

	dispositivo.ongattserverdisconnected = desconectar;
	monitorarSensor();

    botaoConectar.style.display = 'none';
    botaoDesconectar.style.display = 'initial';
};

const desconectar = () => {
    dispositivo = null;
    caracteristica = null;
  
    botaoConectar.style.display = 'initial';
    botaoDesconectar.style.display = 'none';
};

botaoDesconectar.onclick = async () => {
    await dispositivo.gatt.disconnect();
    desconectar();
};


const monitorarSensor = () => {
	caracteristica.addEventListener('characteristicvaluechanged', 
	(evt) => {
		const dado = evt.target.value.getInt16(0, true);
		document.getElementById('valorX').value = (dado/1000);
	});
	caracteristica.startNotifications();
};

let grafico = new Chart(ctx, {
	type: 'scatter',
	data: {
		datasets: [{
			backgroundColor : 'rgba(0, 1, 0, 1)',
			data: []
		}, {
			backgroundColor : 'rgba(1, 1, 0, 1)',
			type: 'line',
			fill: false,
			pointRadius: 0,
			data: []
		}]
	},
	options: {
		responsive: true,
		legend: {
            display: false,
		},
	}

});

document.getElementById('registrar').onclick = () => { 
	const tabela = document.getElementById('tabela')
	const linhaTabela = document.createElement("tr");
	const campoX = document.createElement("th");
	const campoY = document.createElement("th");

	const valor_x = document.getElementById("valorX").value;
	const valor_y = document.getElementById("valorY").value
	campoX.innerText = valor_x;
	campoY.innerText = valor_y;

	campoX.classList.add('py-2');
	campoY.classList.add('py-2');

	linhaTabela.appendChild(campoX);
	linhaTabela.appendChild(campoY);
	tabela.appendChild(linhaTabela);

	dadosGrafico.push({
        x: parseFloat(valor_x),
        y: parseFloat(valor_y),
	});
	
	grafico.data.datasets[0].data = dadosGrafico;
    grafico.update();
    
}

menuExemplo.onclick = () => { 
	dadosGrafico = [
		{ x: 0.15, y: 0.767 },
		{ x: 0.22, y: 0.934 }, 
		{ x: 0.30, y: 1.104},
		{ x: 0.40, y: 1.261},
		{ x: 0.51, y: 1.435},
		{ x: 0.59, y: 1.549},
		{ x: 0.67, y: 1.660},
		{ x: 0.72, y: 1.714},
		{ x: 0.82, y: 1.822},
	];
	grafico.data.datasets[1].data = [];
	atualizarTabela();
}

botaoLinearizary.onclick = () => { 
	dadosGrafico = dadosGrafico.map(function(num) {
		return {x: num.x, y: parseFloat((num.y**2).toFixed(3))};
	});
	atualizarTabela();
}

botaoLinearizarRaizY.onclick = () => { 
	dadosGrafico = dadosGrafico.map(function(num) {
		return {x: num.x, y: parseFloat((num.y**0.5).toFixed(3))};
	});
	atualizarTabela();
}

botaoLinearizarx.onclick = () => { 
	dadosGrafico = dadosGrafico.map(function(num) {
		return {x: parseFloat((num.x**2).toFixed(3)), y: num.y};
	});
	atualizarTabela();
}

botaoLinearizarRaizX.onclick = () => { 
	dadosGrafico = dadosGrafico.map(function(num) {
		return {x: parseFloat((num.x**0.5).toFixed(3)), y: num.y};
	});
	atualizarTabela();
}

const atualizarTabela = () => {

	const tabela = document.getElementById('tabela')
	tabela.innerHTML = ''

	dadosGrafico.forEach(dado => {
		const linhaTabela = document.createElement("tr");
		const campoComprimento = document.createElement("th");
		const campoPeriodo = document.createElement("th");

		campoComprimento.innerText = dado.x;
		campoPeriodo.innerText = dado.y;

		campoComprimento.classList.add('py-2');
		campoPeriodo.classList.add('py-2');

		linhaTabela.appendChild(campoComprimento);
		linhaTabela.appendChild(campoPeriodo);
		tabela.appendChild(linhaTabela);
		
	});
	grafico.data.datasets[0].data = dadosGrafico;
    grafico.update();

}


menuRegressao.onclick = () => { 

	const clean_data = dadosGrafico
    .filter(({ x, y }) => {
      return (
        typeof x === typeof y &&  // filter out one string & one number
        !isNaN(x) &&              // filter out `NaN`
        !isNaN(y) &&
        Math.abs(x) !== Infinity && 
        Math.abs(y) !== Infinity
      );
    })
    .map(({ x, y }) => {
      return [x, y];             // we need a list of [[x1, y1], [x2, y2], ...]
	});


	const my_regression = regression.linear(
		clean_data
	);	

	const useful_points = my_regression.points.map(([x, y]) => {
		return {x, y};    
		// or {x, y}, depending on whether you just want y-coords for a 'linear' plot
		// or x&y for a 'scatterplot'
	})

	grafico.data.datasets[1].data = useful_points;
	grafico.update();
	
	let r = document.getElementById('resultadoRegressao')
	r.innerText = my_regression.string

}



	
