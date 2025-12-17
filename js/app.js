
/**app.js - Arquivo principal da aplicação
* Responsável pela inicialização e envio do formulário para a calculadora de CO2 */

// Aguarde até que o DOM esteja totalmente carregado antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * INICIALIZAÇÃO
     * Configura a calculadora ao carregar a página
     */
    
    // Inicializa o sistema completo (autocomplete + distância automática)
    CONFIG.initialize();
    
    // Obtém o elemento do formulário da calculadora
    const calculatorForm = document.getElementById('calculator-form');
    
    // Adiciona listener para o evento de envio do formulário
    calculatorForm.addEventListener('submit', handleFormSubmit);
    
    // Registro de inicialização bem-sucedida
    console.log('✅ Calculadora inicializada!');
    
    /**
     * MANIPULADOR DE ENVIO DO FORMULÁRIO
     * Processa os dados do formulário e exibe os resultados do cálculo
     * @param {Event} event - Evento de envio de formulário
     */
    function handleFormSubmit(event) {
        // Impede o comportamento padrão de envio do formulário
        event.preventDefault();
        
        /**
         * PASSO 1: Obter e validar valores do formulário
         */
        
        // Obtém o valor da cidade de origem (removendo espaços extras)
        const origin = document.getElementById('origin').value.trim();
        
        // Obtém o valor da cidade de destino (removendo espaços extras)
        const destination = document.getElementById('destination').value.trim();
        
        // Obtém o valor da distância e converte para float
        const distanceInput = document.getElementById('distance').value;
        const distance = parseFloat(distanceInput);
        
        // Obtém o modo de transporte selecionado a partir dos botões de rádio
        const transportModeInput = document.querySelector('input[name="transport"]:checked');
        const transportMode = transportModeInput ? transportModeInput.value : null;
        
        /**
         * PASSO 2: Validar entradas
         */
        
        // Verifique se todos os campos obrigatórios foram preenchidos.
        if (!origin || !destination) {
            alert('❌ Por favor, preencha a origem e o destino.');
            return;
        }
        
        if (!distance || distance <= 0) {
            alert('❌ Por favor, insira uma distância válida maior que zero.');
            return;
        }
        
        if (!transportMode) {
            alert('❌ Por favor, selecione um meio de transporte.');
            return;
        }
        
        /**
         * PASSO 3: Exibir estado de carregamento
         */
        
        // Obtém o elemento do botão de envio
        const submitButton = calculatorForm.querySelector('.form-submit');
        
        // Exibe o spinner de carregamento no botão
        UI.showLoading(submitButton);
        
        // Oculta quaisquer resultados anteriores
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');
        
        /**
         * PASSO 4: Processar cálculo com atraso simulado
         * Simula chamada de API ou processamento pesado
         */
        
        setTimeout(function() {
            try {
                /**
                 * CÁLCULOS
                 */
                
                // Calcula a emissão para o modo de transporte selecionado
                const emission = Calculator.calculateEmission(distance, transportMode);
                
                // Calcula a emissão do carro como referência para comparação
                const carEmission = Calculator.calculateEmission(distance, 'car');
                
                // Calcula a economia em comparação ao carro (se não estiver usando carro)
                const savings = transportMode !== 'car' 
                    ? Calculator.calculateSavings(emission, carEmission)
                    : null;
                
                // Calcula as emissões para todos os modos de transporte para comparação
                const allModesComparison = Calculator.calculateAllModes(distance);
                
                // Calcula os créditos de carbono necessários para compensar a emissão
                const carbonCredits = Calculator.calculateCarbonCredits(emission);
                
                // Calcula o preço estimado para os créditos de carbono
                const creditPrice = Calculator.estimateCreditPrice(carbonCredits);
                
                /**
                 * CONSTRUIR OBJETOS DE DADOS PARA RENDERIZAÇÃO
                 */
                
                // Objeto de dados dos resultados principais
                const resultsData = {
                    origin: origin,
                    destination: destination,
                    distance: distance,
                    emission: emission,
                    mode: transportMode,
                    savings: savings
                };
                
                // Objeto de dados dos créditos de carbono
                const creditsData = {
                    credits: carbonCredits,
                    price: creditPrice
                };
                
                /**
                 * RENDERIZAR RESULTADOS
                 */
                
                // Renderizar a seção de resultados principais
                const resultsHTML = UI.renderResults(resultsData);
                document.getElementById('results-content').innerHTML = resultsHTML;
                
                // Renderizar a seção de comparação
                const comparisonHTML = UI.renderComparison(allModesComparison, transportMode);
                document.getElementById('comparison-content').innerHTML = comparisonHTML;
                
                // Renderizar a seção de créditos de carbono
                const creditsHTML = UI.renderCarbonCredits(creditsData);
                document.getElementById('carbon-credits-content').innerHTML = creditsHTML;
                
                /**
                 * EXIBIR RESULTADOS
                 */
                
                // Exibir todas as seções de resultados
                UI.showElement('results');
                UI.showElement('comparison');
                UI.showElement('carbon-credits');
                
                // Rolagem suave para a seção de resultados
                UI.scrollToElement('results');
                
                // Ocultar estado de carregamento e restaurar botão
                UI.hideLoading(submitButton);
                
                // Registrar sucesso no console
                console.log('✅ Cálculo concluído:', {
                    emission: emission,
                    credits: carbonCredits,
                    savings: savings
                });
                
            } catch (error) {
                /**
                 * TRATAMENTO DE ERROS
                 */
                
                // Registre os detalhes do erro no console para depuração.
                console.error('❌ Erro ao calcular emissões:', error);
                
                // Exibir mensagem de erro amigável ao usuário
                alert('❌ Ocorreu um erro ao calcular as emissões. Por favor, tente novamente.');
                
                // Ocultar estado de carregamento e restaurar botão
                UI.hideLoading(submitButton);
            }
            
        }, 1500); // 1.5 second delay to simulate processing
    }
    
});