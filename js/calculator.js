/**
 * Calculadora -Objeto de calculadora global para emissões de CO2
 *Contém todos os métodos de cálculo de emissões, comparações e créditos de carbono
 */

const Calculator = {
    /**
     * Calcular a emissão de CO2 para uma determinada distância e modo de transporte
     * @param {number} distanceKm - Distância em quilômetros
     * @param {string} transportMode - Chave do modo de transporte (bicicleta, carro, ônibus, caminhão)
     * @returns {number} Emissão de CO2 em quilogramas, arredondado para 2 casas decimais
     */
    calculateEmission: function(distanceKm, transportMode) {
        // Obtenha o fator de emissão para o modo de transporte especificado
        const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];
        
        // Calcular emissão: distância *fator de emissão
        const emission = distanceKm * emissionFactor;
        
        // Retornar resultado arredondado para 2 casas decimais
        return Math.round(emission * 100) / 100;
    },

    /**
     * Calcular as emissões para todos os modos de transporte e comparar com o automóvel como referência
     * @param {number} distanceKm -Distância em quilômetros
     * @returns {Array} Matriz de objetos com modo, emissão e porcentagem versus carro, classificados por emissão
     */
    calculateAllModes: function(distanceKm) {
        // Matriz para armazenar resultados de cálculo
        const results = [];
        
        // Primeiro, calcule as emissões do carro como linha de base para comparação
        const carEmission = this.calculateEmission(distanceKm, 'car');
        
        // Calcular a emissão para cada modo de transporte
        for (const mode in CONFIG.EMISSION_FACTORS) {
            // Calcular a emissão para este modo
            const emission = this.calculateEmission(distanceKm, mode);
            
            // Calcular a porcentagem em comparação ao carro (linha de base)
            // Lidar com casos extremos em que a emissão do carro é 0
            const percentageVsCar = carEmission > 0 
                ? Math.round((emission / carEmission) * 100 * 100) / 100
                : 0;
            
            // Adicionar objeto de resultado ao array
            results.push({
                mode: mode,
                emission: emission,
                percentageVsCar: percentageVsCar
            });
        }
        
        // Classifique a matriz por emissão (o mais baixo primeiro para classificação ecológica)
        results.sort((a, b) => a.emission - b.emission);
        
        return results;
    },

    /**
     * Calcule a economia de CO2 em comparação com uma emissão de referência
     * @param {number} emission -Emissão atual em kg CO2
     * @param {number} baselineEmission -Emissão de linha de base para comparação em kg CO2
     * @returns {Object} Objeto com propriedades saveKg e porcentagem
     */
    calculateSavings: function(emission, baselineEmission) {
        // Calculate how many kg of CO2 were saved
        const savedKg = baselineEmission - emission;
        
        // Calcular porcentagem de economia
        // Lidar com casos extremos onde a linha de base é 0
        const percentage = baselineEmission > 0
            ? (savedKg / baselineEmission) * 100
            : 0;
        
        // Retornar objeto com valores arredondados
        return {
            savedKg: Math.round(savedKg * 100) / 100,
            percentage: Math.round(percentage * 100) / 100
        };
    },

    /**
     * Calcular os créditos de carbono necessários para compensar a emissão
     * @param {number} emissionKg - CO2 emission in kilograms
     * @returns {number} Number of carbon credits needed, rounded to 4 decimal places
     */
    calculateCarbonCredits: function(emissionKg) {
        // Cada crédito de carbono compensa uma certa quantidade de CO2 (definida no CONFIG)
        const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
        
        // Retornar arredondado para 4 casas decimais para precisão
        return Math.round(credits * 10000) / 10000;
    },

    /**
     * Estime a faixa de preço dos créditos de carbono em reais
     * @param {number} credits -Número de créditos de carbono
     * @returns {Object} Objeto com preço mínimo, máximo e médio em reais
     */
    estimateCreditPrice: function(credits) {
        // Calcule o preço mínimo com base na baixa taxa de mercado
        const min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
        
        // Calcule o preço máximo com base na alta taxa de mercado
        const max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
        
        // Calcular o preço médio (ponto médio do intervalo)
        const average = (min + max) / 2;
        
        // Retornar objeto com todos os preços arredondados para 2 casas decimais
        return {
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            average: Math.round(average * 100) / 100
        };
    }
};