const { useState } = require("react");

const Calculadora = () => {

    const [valor1, setValor1] = useState("");
    const [valor2, setValor2] = useState("");
    const [operador, setOperador] = useState("");
    const [resultado, setResultado] = useState("");

    const calcular = () => {

        const v1 = parseFloat(valor1);
        const v2 = parseFloat(valor2);

        if (isNaN(v1) || isNaN(v2)) {
            return setResultado('valors Invalidos');
        }

        switch (operador) {
            case '+':
			    return setResultado(v1 + v2);

            case '-':
			    return setResultado(v1 - v2);

            case '*':
			    return setResultado(v1 * v2);

            case '/':
			    return setResultado(v2 !== 0 ? v1 / v2 : 'Divisao por 0');

            default:
                return setResultado('Operador Invalido');
        }
    }

    return (
        <>
            Valor 1:
            <input value={valor1} onChange={e => setValor1(e.target.value)} style={{marginTop: "20px"}} /><br></br>
            Valor 2:
            <input value={valor2} onChange={e => setValor2(e.target.value)} style={{marginTop: "20px"}} /><br></br>
            Operador:
            <input value={operador} onChange={e => setOperador(e.target.value)} style={{marginTop: "20px"}} /><br></br>
            <br></br>
            <button onClick={calcular} style={{marginTop: "20px"}}> Calcular </button>
            <br></br>
                {resultado}   
	</>
	);

}

export default Calculadora;
